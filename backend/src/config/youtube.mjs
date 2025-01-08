// src/config/youtube.js
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
				accessType: "offline",
				prompt: "consent",
				state: true,
				passReqToCallback: true,
			},
			async (req, accessToken, refreshToken, params, profile, done) => {
				try {
					const response = await fetch(
						"https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
						{
							headers: {
								Authorization: `Bearer ${accessToken}`,
							},
						}
					);

					if (!response.ok)
						throw new Error("Failed to fetch YouTube channel info");

					const data = await response.json();
					const channel = data.items[0];

					const youtubeData = {
						accessToken,
						refreshToken,
						channelId: channel.id,
						channelTitle: channel.snippet.title,
						channelStats: {
							subscribers: channel.statistics.subscriberCount,
							videos: channel.statistics.videoCount,
						},
					};

					console.log("youtube: ", { youtube: youtubeData });

					return done(null, { ...req.user, youtube: youtubeData });
				} catch (error) {
					return done(error);
				}
			}
		)
	);
}
