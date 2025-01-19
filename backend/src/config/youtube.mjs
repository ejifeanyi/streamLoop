import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { google } from "googleapis";
import { prisma } from "../utils/prisma.mjs";

export const YOUTUBE_SCOPES = [
	"https://www.googleapis.com/auth/youtube.force-ssl",
	"https://www.googleapis.com/auth/youtube",
];

const youtube = google.youtube("v3");

// Export these as named exports
export const youtubeOAuth2Client = new google.auth.OAuth2(
	process.env.YOUTUBE_CLIENT_ID,
	process.env.YOUTUBE_CLIENT_SECRET,
	`${process.env.BACKEND_URL}/platform/youtube/callback`
);

// Make sure this is exported
export const refreshYouTubeToken = async (refreshToken) => {
	try {
		youtubeOAuth2Client.setCredentials({
			refresh_token: refreshToken,
		});

		const { credentials } = await youtubeOAuth2Client.refreshAccessToken();

		return {
			accessToken: credentials.access_token,
			refreshToken: credentials.refresh_token || refreshToken,
			expiresIn: credentials.expires_in,
			expiryDate: Date.now() + credentials.expires_in * 1000,
			tokenType: credentials.token_type || "Bearer",
		};
	} catch (error) {
		console.error("Error refreshing YouTube token:", error);
		throw error;
	}
};

export const configureYouTubeStrategy = () => {
	// Define custom OAuth2Strategy that forces refresh token
	class YouTubeOAuth2Strategy extends OAuth2Strategy {
		authorizationParams(options) {
			return Object.assign(super.authorizationParams(options), {
				access_type: "offline",
				prompt: "consent",
				include_granted_scopes: true,
			});
		}

		tokenParams(options) {
			return Object.assign(super.tokenParams(options), {
				grant_type: "authorization_code",
			});
		}
	}

	const strategyConfig = {
		authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
		tokenURL: "https://oauth2.googleapis.com/token",
		clientID: process.env.YOUTUBE_CLIENT_ID,
		clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
		callbackURL: `${process.env.BACKEND_URL}/platform/youtube/callback`,
		scope: YOUTUBE_SCOPES,
		passReqToCallback: true,
	};

	const verifyFunction = async (
		req,
		accessToken,
		refreshToken,
		params,
		profile,
		done
	) => {
		try {
			if (!refreshToken) {
				console.error("No refresh token received from Google");
			}

			console.log("Token exchange successful:", {
				accessToken: accessToken ? "Present" : "Missing",
				refreshToken: refreshToken ? "Present" : "Missing",
				params,
			});

			if (!req.user) {
				return done(new Error("No authenticated user found"));
			}

			youtubeOAuth2Client.setCredentials({
				access_token: accessToken,
				refresh_token: refreshToken,
				expiry_date: Date.now() + params.expires_in * 1000,
				token_type: "Bearer",
			});

			const response = await youtube.channels.list({
				auth: youtubeOAuth2Client,
				part: ["snippet,statistics"],
				mine: true,
			});

			if (!response.data.items || response.data.items.length === 0) {
				return done(new Error("No YouTube channel found"));
			}

			const channel = response.data.items[0];

			// Update the user with YouTube information
			const updatedUser = await prisma.user.update({
				where: { id: req.user.id },
				data: {
					connectedAccounts: {
						upsert: {
							where: {
								userId_platform_accountId: {
									userId: req.user.id,
									platform: "YOUTUBE",
									accountId: channel.id,
								},
							},
							create: {
								platform: "YOUTUBE",
								accountId: channel.id,
								accessToken,
								refreshToken,
								tokenExpiry: new Date(Date.now() + params.expires_in * 1000),
								isActive: true,
								status: "ready",
								channelData: {
									channelId: channel.id,
									title: channel.snippet.title,
									description: channel.snippet.description,
									statistics: channel.statistics,
									thumbnails: channel.snippet.thumbnails,
								},
							},
							update: {
								accessToken,
								refreshToken,
								tokenExpiry: new Date(Date.now() + params.expires_in * 1000),
								channelData: {
									channelId: channel.id,
									title: channel.snippet.title,
									description: channel.snippet.description,
									statistics: channel.statistics,
									thumbnails: channel.snippet.thumbnails,
								},
							},
						},
					},
				},
				include: {
					connectedAccounts: true,
				},
			});

			return done(null, updatedUser);
		} catch (error) {
			console.error("Error in YouTube strategy verification:", error);
			return done(error);
		}
	};

	// Use our custom strategy instead of the default OAuth2Strategy
	passport.use(
		"youtube",
		new YouTubeOAuth2Strategy(strategyConfig, verifyFunction)
	);
};
