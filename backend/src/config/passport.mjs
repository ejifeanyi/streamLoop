import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as CustomStrategy } from "passport-custom";
import passport from "passport";
import { prisma } from "../utils/prisma.mjs";

export default function configurePassport() {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: "http://localhost:5000/auth/google/callback",
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const user = await prisma.user.upsert({
						where: { googleId: profile.id },
						update: {
							email: profile.emails[0].value,
							name: profile.displayName,
							picture: profile.photos[0].value,
						},
						create: {
							googleId: profile.id,
							email: profile.emails[0].value,
							name: profile.displayName,
							picture: profile.photos[0].value,
						},
					});
					done(null, user);
				} catch (error) {
					done(error, null);
				}
			}
		),
		
	);

	 passport.use(
			"tiktok",
			new CustomStrategy(async (req, done) => {
				try {
					const { code } = req.query;
					if (!code) {
						return done(null, false, { message: "No code provided" });
					}

					// Exchange code for access token
					const tokenResponse = await fetch(
						"https://open-api.tiktok.com/oauth/access_token/",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								client_key: process.env.TIKTOK_CLIENT_KEY,
								client_secret: process.env.TIKTOK_CLIENT_SECRET,
								code,
								grant_type: "authorization_code",
							}),
						}
					);

					const tokenData = await tokenResponse.json();

					if (!tokenData.access_token) {
						return done(null, false, { message: "Failed to get access token" });
					}

					// Get TikTok user info
					const userResponse = await fetch(
						"https://open-api.tiktok.com/oauth/userinfo/",
						{
							headers: {
								Authorization: `Bearer ${tokenData.access_token}`,
							},
						}
					);

					const userData = await userResponse.json();

					// Store TikTok connection in database
					const connection = await prisma.connectedAccount.create({
						data: {
							userId: req.user.id,
							platform: "tiktok",
							accountId: userData.open_id,
							accessToken: tokenData.access_token,
							refreshToken: tokenData.refresh_token,
						},
					});

					done(null, connection);
				} catch (error) {
					done(error);
				}
			})
		);

	passport.serializeUser((user, done) => done(null, user.id));
	passport.deserializeUser(async (id, done) => {
		try {
			const user = await prisma.user.findUnique({ where: { id } });
			done(null, user);
		} catch (error) {
			done(error, null);
		}
	});
}
