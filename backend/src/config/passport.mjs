// src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../utils/prisma.mjs";
import "dotenv/config";

export function configurePassport() {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
				scope: ["email", "profile"],
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const email = profile.emails?.[0]?.value;
					if (!email) throw new Error("No email found in Google profile");

					const user = await prisma.user.upsert({
						where: { email },
						update: {
							googleId: profile.id,
							name: profile.displayName,
							picture: profile.photos?.[0]?.value,
						},
						create: {
							email,
							googleId: profile.id,
							name: profile.displayName,
							picture: profile.photos?.[0]?.value,
						},
					});
					console.log(`Authentication successful for user: ${user.email}`);
					done(null, user);
				} catch (error) {
					done(error);
				}
			}
		)
	);

	passport.serializeUser((user, done) => done(null, user.id));
	passport.deserializeUser(async (id, done) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id },
				include: { connectedAccounts: true },
			});
			done(null, user);
		} catch (error) {
			done(error);
		}
	});
}
