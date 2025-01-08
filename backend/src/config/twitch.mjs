// src/config/twitch.mjs
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import passport from "passport";

export const TWITCH_SCOPES = [
	"channel:read:stream_key",
	"channel:manage:broadcast",
	"user:read:email",
];

export function configureTwitchStrategy() {
	passport.use(
		"twitch",
		new OAuth2Strategy(
			{
				authorizationURL: "https://id.twitch.tv/oauth2/authorize",
				tokenURL: "https://id.twitch.tv/oauth2/token",
				clientID: process.env.TWITCH_CLIENT_ID,
				clientSecret: process.env.TWITCH_CLIENT_SECRET,
				callbackURL: `${process.env.BACKEND_URL}/auth/twitch/callback`,
				scope: TWITCH_SCOPES,
				state: true,
				passReqToCallback: true,
			},
			async (req, accessToken, refreshToken, params, profile, done) => {
				try {
					const response = await fetch("https://api.twitch.tv/helix/users", {
						headers: {
							Authorization: `Bearer ${accessToken}`,
							"Client-Id": process.env.TWITCH_CLIENT_ID,
						},
					});

					if (!response.ok) throw new Error("Failed to fetch Twitch user info");

					const data = await response.json();
					const user = data.data[0];

					const twitchData = {
						accessToken,
						refreshToken,
						channelId: user.id,
						channelTitle: user.display_name,
						channelData: {
							login: user.login,
							profileImageUrl: user.profile_image_url,
							broadcasterType: user.broadcaster_type,
						},
					};

					console.log("twitch: ", { twitch: twitchData });

					return done(null, { ...req.user, twitch: twitchData });
				} catch (error) {
					return done(error);
				}
			}
		)
	);
}
