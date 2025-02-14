// src/routes/stream.routes.mjs
import express from "express";
import { StreamService } from "../services/stream.service.mjs";
import { isAuthenticated } from "../middleware/auth.mjs";

const router = express.Router();

router.post("/create", isAuthenticated, async (req, res) => {
	try {
		const { title, quality, bitrate, resolution, frameRate } = req.body;
		const stream = await StreamService.createStream(req.user.id, {
			title,
			quality,
			bitrate,
			resolution,
			frameRate,
		});
		res.json(stream);
	} catch (error) {
		console.error("Error creating stream:", error);
		res.status(500).json({ error: error.message });
	}
});

router.post("/:streamId/start", isAuthenticated, async (req, res) => {
	try {
		const { streamId } = req.params;
		const stream = await StreamService.startStream(req.user.id, streamId);
		res.json(stream);
	} catch (error) {
		console.error("Error starting stream:", error);
		res.status(500).json({ error: error.message });
	}
});

router.post("/:streamId/push", isAuthenticated, async (req, res) => {
	try {
		const { streamId } = req.params;
		await StreamService.pushStreamData(req.user.id, streamId, req);
		res.json({ success: true });
	} catch (error) {
		console.error("Error pushing stream data:", error);
		res.status(500).json({ error: error.message });
	}
});

router.post("/:streamId/end", isAuthenticated, async (req, res) => {
	try {
		const { streamId } = req.params;
		const stream = await StreamService.endStream(req.user.id, streamId);
		res.json(stream);
	} catch (error) {
		console.error("Error ending stream:", error);
		res.status(500).json({ error: error.message });
	}
});

export default router;
