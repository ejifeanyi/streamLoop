import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { prisma } from "../utils/prisma.mjs";

export default function configurePassport() {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: "/auth/google/callback",
				scope: ["email", "profile"],
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const email = profile.emails?.[0]?.value || profile._json?.email;

					if (!email) {
						return done(new Error("No email found in Google profile"));
					}

					let user = await prisma.user.findUnique({
						where: { googleId: profile.id },
					});

					if (!user) {
						user = await prisma.user.findUnique({
							where: { email: email },
						});
					}

					if (user) {
						user = await prisma.user.update({
							where: { id: user.id },
							data: {
								googleId: profile.id,
								email: email,
								name: profile.displayName,
								picture: profile.photos?.[0]?.value,
							},
						});
					} else {
						user = await prisma.user.create({
							data: {
								googleId: profile.id,
								email: email,
								name: profile.displayName,
								picture: profile.photos?.[0]?.value,
							},
						});
					}

					return done(null, user);
				} catch (error) {
					console.error("Error in Google OAuth callback:", error);
					return done(error);
				}
			}
		)
	);

	passport.serializeUser((user, done) => {
		// Serialize just the user ID
		done(null, user.id);
	});

	passport.deserializeUser(async (id, done) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id },
				include: {
					connectedAccounts: true,
				},
			});

			// If there's YouTube data in the session, it will be handled by the
			// YouTube callback route when storing in the database
			done(null, user);
		} catch (error) {
			done(error);
		}
	});
}
