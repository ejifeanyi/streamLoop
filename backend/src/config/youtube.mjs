import { google } from "googleapis";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { prisma } from "../utils/prisma.mjs";

export const YOUTUBE_SCOPES = [
	"https://www.googleapis.com/auth/youtube.force-ssl",
	"https://www.googleapis.com/auth/youtube",
	"https://www.googleapis.com/auth/youtube.live_stream",
];

const youtube = google.youtube("v3");

export const youtubeOAuth2Client = new google.auth.OAuth2(
	process.env.YOUTUBE_CLIENT_ID,
	process.env.YOUTUBE_CLIENT_SECRET,
	`${process.env.BACKEND_URL}/platform/youtube/callback`
);

export const refreshYouTubeToken = async (refreshToken) => {
	try {
		youtubeOAuth2Client.setCredentials({
			refresh_token: refreshToken,
		});

		console.log("Refreshing token with refresh token:", refreshToken);
		const { credentials } = await youtubeOAuth2Client.refreshAccessToken();

		console.log("Received credentials:", {
			hasAccessToken: !!credentials.access_token,
			hasRefreshToken: !!credentials.refresh_token,
			expiresIn: credentials.expires_in,
		});

		// Default to 1 hour if no expiration time is provided
		const expiresIn = credentials.expires_in || 3600;

		// Calculate expiry date
		const expiryDate = new Date(Date.now() + expiresIn * 1000);

		console.log("Calculated expiry date:", expiryDate);
		console.log("Is valid date:", !isNaN(expiryDate.getTime()));

		return {
			accessToken: credentials.access_token,
			refreshToken: credentials.refresh_token || refreshToken,
			expiresIn: expiresIn,
			expiryDate: expiryDate,
			tokenType: credentials.token_type || "Bearer",
		};
	} catch (error) {
		console.error("Error refreshing token:", error);
		if (error.response?.data?.error === "invalid_grant") {
			throw new Error(
				"Refresh token is invalid or expired. Please re-authenticate."
			);
		}
		throw error;
	}
};

export const configureYouTubeStrategy = () => {
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

			if (!req.user) {
				return done(new Error("No authenticated user found"));
			}

			youtubeOAuth2Client.setCredentials({
				access_token: accessToken,
				refresh_token: refreshToken,
				expiry_date: Date.now() + params.expires_in * 1000,
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
			const tokenExpiry = new Date(Date.now() + params.expires_in * 1000);

			const updatedUser = await prisma.user.update({
				where: { id: req.user.id },
				data: {
					connectedAccounts: {
						upsert: {
							where: {
								userId_platform: {
									userId: req.user.id,
									platform: "YOUTUBE",
								},
							},
							create: {
								platform: "YOUTUBE",
								accountId: channel.id,
								accessToken,
								refreshToken,
								tokenExpiry,
								lastRefresh: new Date(),
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
								tokenExpiry,
								lastRefresh: new Date(),
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

	passport.use(
		"youtube",
		new YouTubeOAuth2Strategy(strategyConfig, verifyFunction)
	);
};
