// src/controllers/stream.controller.mjs
import { webRTCService } from "../services/webrtc.service.mjs";
import { rtmpService } from "../services/rtmp.service.mjs";
import { createLogger } from "../utils/logger.mjs";

const logger = createLogger("StreamController");

export const handleOffer = async (req, res) => {
	try {
		const { offer } = req.body;
		const userId = req.user.id;

		if (!offer) {
			return res.status(400).json({ error: "SDP offer is required" });
		}

		const answer = await webRTCService.handleOffer(userId, offer);

		// Start RTMP streaming for this user
		rtmpService.startStreaming(userId);

		res.status(200).json({ answer });
	} catch (error) {
		logger.error("Error handling WebRTC offer", error);
		res.status(500).json({ error: "Failed to establish WebRTC connection" });
	}
};

export const handleIceCandidate = async (req, res) => {
	try {
		const { candidate } = req.body;
		const userId = req.user.id;

		if (!candidate) {
			return res.status(400).json({ error: "ICE candidate is required" });
		}

		await webRTCService.handleIceCandidate(userId, candidate);
		res.status(200).json({ success: true });
	} catch (error) {
		logger.error("Error handling ICE candidate", error);
		res.status(500).json({ error: "Failed to process ICE candidate" });
	}
};

export const endStream = (req, res) => {
	try {
		const userId = req.user.id;

		// Stop RTMP streaming
		rtmpService.stopStreaming(userId);

		// Close WebRTC connection
		webRTCService.closeConnection(userId);

		res
			.status(200)
			.json({ success: true, message: "Stream ended successfully" });
	} catch (error) {
		logger.error("Error ending stream", error);
		res.status(500).json({ error: "Failed to end stream" });
	}
};
