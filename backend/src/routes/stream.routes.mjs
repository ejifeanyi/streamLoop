// src/routes/stream.routes.mjs
import express from "express";
import { isAuthenticated } from "../middleware/auth.mjs";
import { StreamService } from "../services/stream.service.mjs";
import { MediaService } from "../services/media.service.mjs";
import { ChunkService } from "../services/chunk.service.mjs";

const router = express.Router();

// Add these routes to your existing stream.routes.mjs
router.post("/:sessionId/push", isAuthenticated, async (req, res) => {
	const { sessionId } = req.params;
	const chunkNumber = parseInt(req.headers["x-chunk-number"]);

	try {
		const qualities = Object.keys(MediaService.QUALITIES);
		const processPromises = qualities.map(async (quality) => {
			const processedStream = await MediaService.processStreamChunk(
				req,
				sessionId,
				quality
			);
			await ChunkService.trackChunk(
				sessionId,
				chunkNumber,
				quality,
				MediaService.CHUNK_DURATION
			);

			// Store the processed chunk (implement your storage solution)
			// await storageService.storeChunk(processedStream, sessionId, chunkNumber, quality);
		});

		await Promise.all(processPromises);
		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Error processing chunk:", error);
		res.status(500).json({ error: error.message });
	}
});

router.get("/:sessionId/manifest", async (req, res) => {
	try {
		const manifest = MediaService.createManifest(
			req.params.sessionId,
			Object.keys(MediaService.QUALITIES)
		);
		res.json(manifest);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get("/:sessionId/quality/:quality/chunk/:number", async (req, res) => {
	const { sessionId, quality, number } = req.params;

	try {
		const chunk = await ChunkService.getChunkStatus(
			sessionId,
			parseInt(number),
			quality
		);
		if (!chunk) {
			return res.status(404).json({ error: "Chunk not found" });
		}

		// Implement your chunk retrieval logic here
		// const chunkData = await storageService.getChunk(sessionId, number, quality);
		// res.send(chunkData);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.post("/create", isAuthenticated, async (req, res) => {
	try {
		const session = await StreamService.createStreamSession(
			req.user.id,
			req.body
		);
		res.json(session);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.post("/:sessionId/start", isAuthenticated, async (req, res) => {
	try {
		const session = await StreamService.startStream(req.params.sessionId);
		res.json(session);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.post("/:sessionId/end", isAuthenticated, async (req, res) => {
	try {
		const session = await StreamService.endStream(req.params.sessionId);
		res.json(session);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
