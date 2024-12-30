// config/youtube.mjs
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import passport from "passport";

export const YOUTUBE_SCOPES = [
	"https://www.googleapis.com/auth/youtube",
	"https://www.googleapis.com/auth/youtube.force-ssl",
];

export function configureYouTubeStrategy() {
	passport.use(
		"youtube",
		new OAuth2Strategy(
			{
				authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
				tokenURL: "https://oauth2.googleapis.com/token",
				clientID: process.env.YOUTUBE_CLIENT_ID,
				clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
				callbackURL: `${process.env.BACKEND_URL}/auth/youtube/callback`,
				scope: YOUTUBE_SCOPES,
				state: true,
				passReqToCallback: true,
			},
			async (req, accessToken, refreshToken, profile, done) => {
				// Add req parameter
				try {
					// Fetch YouTube channel info
					const response = await fetch(
						"https://youtube.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true",
						{
							headers: {
								Authorization: `Bearer ${accessToken}`,
							},
						}
					);

					if (!response.ok) {
						throw new Error("Failed to fetch YouTube channel info");
					}

					const data = await response.json();
					if (!data.items || data.items.length === 0) {
						throw new Error("No YouTube channel found");
					}

					const channel = data.items[0];

					// Merge YouTube data with existing user data
					const youtubeData = {
						...req.user, // Keep existing user data
						youtube: {
							// Add YouTube specific data
							accessToken,
							refreshToken,
							channelId: channel.id,
							channelTitle: channel.snippet.title,
							channelStats: {
								subscribers: channel.statistics.subscriberCount,
								videos: channel.statistics.videoCount,
							},
						},
					};

					return done(null, youtubeData);
				} catch (error) {
					console.error("YouTube strategy error:", error);
					return done(error);
				}
			}
		)
	);
}
