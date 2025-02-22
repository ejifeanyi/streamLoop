// src/routes/platform.routes.js
import express from "express";
import passport from "passport";
import { google } from "googleapis";
import { isAuthenticated, validatePlatform } from "../middleware/auth.mjs";
import { PlatformService } from "../services/platform.service.mjs";
import {
	YOUTUBE_SCOPES,
	refreshYouTubeToken,
	youtubeOAuth2Client,
} from "../config/youtube.mjs";

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

// src/routes/platform.routes.js
router.post("/youtube/create-broadcast", isAuthenticated, async (req, res) => {
	try {
		const { title, description, scheduledStartTime } = req.body;

		// Get the user's YouTube credentials
		const youtubeAccount = req.user.connectedAccounts.find(
			(account) => account.platform === "YOUTUBE"
		);

		if (!youtubeAccount?.refreshToken) {
			throw new Error("No YouTube refresh token found");
		}

		// Refresh the access token
		const { accessToken } = await refreshYouTubeToken(
			youtubeAccount.refreshToken
		);

		// Initialize the YouTube API client
		const youtube = google.youtube({
			version: "v3",
			auth: youtubeOAuth2Client,
		});

		// Set the credentials
		youtubeOAuth2Client.setCredentials({
			access_token: accessToken,
			refresh_token: youtubeAccount.refreshToken,
		});

		// Create a live broadcast
		const broadcastResponse = await youtube.liveBroadcasts.insert({
			part: ["snippet", "status"],
			requestBody: {
				snippet: {
					title,
					description,
					scheduledStartTime,
				},
				status: {
					privacyStatus: "public",
					selfDeclaredMadeForKids: false,
				},
			},
		});

		// Create a stream optimized for browser-based streaming
		const streamResponse = await youtube.liveStreams.insert({
			part: ["snippet", "cdn"],
			requestBody: {
				snippet: {
					title: `${title} - Stream`,
				},
				cdn: {
					frameRate: "30fps",
					ingestionType: "rtmp",
					resolution: "720p", // Default to 720p for better compatibility
					format: "720p", // Match resolution for consistency
				},
			},
		});

		// Bind the broadcast to the stream
		await youtube.liveBroadcasts.bind({
			id: broadcastResponse.data.id,
			part: ["id", "contentDetails"],
			streamId: streamResponse.data.id,
		});

		// Return stream details
		res.json({
			broadcastId: broadcastResponse.data.id,
			streamId: streamResponse.data.id,
			rtmpUrl: streamResponse.data.cdn.ingestionInfo.ingestionAddress,
			streamKey: streamResponse.data.cdn.ingestionInfo.streamName,
			streamConstraints: {
				audio: {
					channelCount: 2,
					echoCancellation: true,
					noiseSuppression: true,
					sampleRate: 44100,
					bitrate: 128000, // 128 kbps for audio
				},
				video: {
					width: { ideal: 1280, min: 640 },
					height: { ideal: 720, min: 360 },
					frameRate: { ideal: 30, min: 15 },
					facingMode: "user",
					aspectRatio: 16 / 9,
				},
			},
		});
	} catch (error) {
		console.error("Error creating YouTube broadcast:", error);
		res.status(500).json({ error: error.message });
	}
});

router.delete(
	"/disconnect/:platform",
	isAuthenticated,
	validatePlatform,
	async (req, res) => {
		try {
			const { platform } = req.params;
			await PlatformService.disconnectPlatform(
				req.user.id,
				platform.toUpperCase()
			);
			res.json({ message: `${platform} account disconnected successfully` });
		} catch (error) {
			console.error(`Error disconnecting ${platform} account:`, error);
			res.status(500).json({ error: error.message });
		}
	}
);

router.patch(
	"/connected-accounts/:accountId/toggle",
	isAuthenticated,
	async (req, res) => {
		try {
			const { accountId } = req.params;
			const { isActive } = req.body;

			const updatedAccount = await PlatformService.togglePlatformStatus(
				req.user.id,
				accountId,
				isActive
			);

			res.json(updatedAccount);
		} catch (error) {
			console.error("Error toggling platform status:", error);
			res.status(500).json({ error: error.message });
		}
	}
);

export default router;
