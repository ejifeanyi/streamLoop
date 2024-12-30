import express from "express";
import passport from "passport";
import { isAuthenticated } from "../middlewares/auth.mjs";
import { YOUTUBE_SCOPES } from "../config/youtube.mjs";
import { prisma } from "../utils/prisma.mjs";

const router = express.Router();

// Initiate YouTube authentication
router.get("/connect/youtube", isAuthenticated, (req, res, next) => {
	console.log("connecting 1");
	passport.authenticate("youtube", {
		scope: YOUTUBE_SCOPES,
		accessType: "offline",
		prompt: "consent",
		state: true,
	})(req, res, next);
});

router.get(
	"/youtube/callback",
	isAuthenticated,
	passport.authenticate("youtube", {
		failureRedirect: `${process.env.CLIENT_URL}/settings?error=youtube_auth_failed`,
		failureMessage: true,
	}),
	async (req, res) => {
		try {
			console.log("connecting 4");
			const youtubeData = req.user.youtube;

			// Store the connection in database
			await prisma.connectedAccount.upsert({
				where: {
					userId_platform_accountId: {
						// Updated this line
						userId: req.user.id,
						platform: "youtube",
						accountId: youtubeData.channelId,
					},
				},
				update: {
					accessToken: youtubeData.accessToken,
					refreshToken: youtubeData.refreshToken || null, // Handle undefined
					channelData: {
						channelTitle: youtubeData.channelTitle,
						subscribers: youtubeData.channelStats.subscribers,
						videos: youtubeData.channelStats.videos,
					},
				},
				create: {
					userId: req.user.id,
					platform: "youtube",
					accountId: youtubeData.channelId,
					accessToken: youtubeData.accessToken,
					refreshToken: youtubeData.refreshToken || null, // Handle undefined
					channelData: {
						channelTitle: youtubeData.channelTitle,
						subscribers: youtubeData.channelStats.subscribers,
						videos: youtubeData.channelStats.videos,
					},
				},
			});

			res.redirect(`${process.env.CLIENT_URL}/settings?youtube=connected`);
		} catch (error) {
			console.error("YouTube connection error:", error);
			res.redirect(
				`${process.env.CLIENT_URL}/settings?error=youtube_connection_failed`
			);
		}
	}
);

export default router;
