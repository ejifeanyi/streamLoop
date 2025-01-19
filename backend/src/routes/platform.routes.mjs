// src/routes/platform.routes.js
import express from "express";
import passport from "passport";
import { isAuthenticated, validatePlatform } from "../middleware/auth.mjs";
import { PlatformService } from "../services/platform.service.mjs";
import { YOUTUBE_SCOPES } from "../config/youtube.mjs";

const router = express.Router();

router.get("/connect/youtube", isAuthenticated, (req, res, next) => {
	const authenticateOptions = {
		accessType: "offline",
		prompt: "consent",
		scope: YOUTUBE_SCOPES,
		state: true,
		includeGrantedScopes: true,
	};

	passport.authenticate("youtube", authenticateOptions)(req, res, next);
});

router.get(
	"/youtube/callback",
	isAuthenticated,
	(req, res, next) => {
		if (req.query.error) {
			console.error("YouTube OAuth error:", req.query.error);
			return res.redirect(
				`${process.env.CLIENT_URL}/dashboard?error=${req.query.error}`
			);
		}

		console.log("Received authorization code:", req.query.code);
		next();
	},
	passport.authenticate("youtube", {
		failureRedirect: `${process.env.CLIENT_URL}/dashboard?error=authentication_failed`,
		failureMessage: true,
	}),
	async (req, res) => {
		try {
			const youtubeAccount = req.user.connectedAccounts.find(
				(account) => account.platform === "YOUTUBE"
			);

			if (!youtubeAccount?.refreshToken) {
				console.error("No refresh token in connected account");
				throw new Error("YouTube account connection failed - no refresh token");
			}

			res.redirect(
				`${process.env.CLIENT_URL}/dashboard?platform=youtube&status=connected`
			);
		} catch (error) {
			console.error("YouTube connection error:", error);
			res.redirect(
				`${process.env.CLIENT_URL}/dashboard?error=youtube_connection_failed`
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
