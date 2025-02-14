// src/config/facebook.mjs
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import passport from "passport";

export const FACEBOOK_SCOPES = [
	"publish_video",
	"manage_pages",
	"pages_show_list",
];

export function configureFacebookStrategy() {
	passport.use(
		"facebook",
		new OAuth2Strategy(
			{
				authorizationURL: "https://www.facebook.com/v19.0/dialog/oauth",
				tokenURL: "https://graph.facebook.com/v19.0/oauth/access_token",
				clientID: process.env.FACEBOOK_CLIENT_ID,
				clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
				callbackURL: `${process.env.BACKEND_URL}/auth/facebook/callback`,
				scope: FACEBOOK_SCOPES,
				profileFields: ["id", "name", "email"],
				state: true,
				passReqToCallback: true,
			},
			async (req, accessToken, refreshToken, params, profile, done) => {
				try {
					const response = await fetch(
						`https://graph.facebook.com/v19.0/me?fields=id,name,picture`,
						{
							headers: { Authorization: `Bearer ${accessToken}` },
						}
					);

					if (!response.ok)
						throw new Error("Failed to fetch Facebook user info");
					const user = await response.json();

					const facebookData = {
						accessToken,
						refreshToken,
						channelId: user.id,
						channelTitle: user.name,
						channelData: {
							profilePicture: user.picture?.data?.url,
						},
					};

					return done(null, { ...req.user, facebook: facebookData });
				} catch (error) {
					return done(error);
				}
			}
		)
	);
}
