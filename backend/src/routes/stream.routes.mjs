// src/routes/stream.routes.mjs
import { Router } from "express";
import { validateStreamRequest } from "../middleware/stream.middleware.mjs";

const router = Router();

// Apply middleware to all stream routes
router.use(validateStreamRequest);

// Get stream status
router.get("/status", (req, res) => {
	const userId = req.user.id;
	res.status(200).json({
		userId,
		isAuthenticated: true,
		youtubeConnected: !!req.user.youtube,
	});
});

// Create a new stream
router.post("/create", async (req, res) => {
	try {
		const userId = req.user.id;
		const {
			title,
			quality,
			bitrate,
			resolution,
			frameRate,
			videoCodec,
			audioCodec,
			audioRate,
		} = req.body;

		// Create the stream in your database
		// This is a placeholder - replace with your actual database logic
		const stream = {
			id: `stream-${Date.now()}`, // Generate a temporary ID
			title,
			userId,
			quality,
			bitrate,
			resolution,
			frameRate,
			videoCodec,
			audioCodec,
			audioRate,
			status: "CREATED",
			createdAt: new Date(),
		};

		// Return the created stream data
		res.status(201).json(stream);
	} catch (error) {
		console.error("Stream creation error:", error);
		res.status(500).json({ error: "Failed to create stream" });
	}
});

export default router;
