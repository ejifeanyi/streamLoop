// src/routes/platform.routes.js
import express from "express";
import passport from "passport";
import { isAuthenticated, validatePlatform } from "../middleware/auth.mjs";
import { PlatformService } from "../services/platform.service.mjs";
import { YOUTUBE_SCOPES } from "../config/youtube.mjs";

const router = express.Router();

router.get("/connect/youtube", isAuthenticated, (req, res, next) => {
	passport.authenticate("youtube", {
		scope: YOUTUBE_SCOPES,
		accessType: "offline", // Add this
		prompt: "consent", // Add this
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
			const youtubeData = req.user.youtube;
			console.log("YouTube data before saving:", youtubeData); // Debug log

			await PlatformService.connectYouTubeAccount(req.user.id, youtubeData);
			res.redirect(`${process.env.CLIENT_URL}/settings?youtube=connected`);
		} catch (error) {
			console.error("YouTube connection error:", error);
			res.redirect(
				`${process.env.CLIENT_URL}/settings?error=youtube_connection_failed`
			);
		}
	}
);

router.get("/accounts", isAuthenticated, async (req, res) => {
	try {
		const accounts = await PlatformService.getConnectedAccounts(req.user.id);
		res.json(accounts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
