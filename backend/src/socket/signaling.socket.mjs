// src/socket/signaling.socket.mjs
import { Server } from "socket.io";
import { webRTCService } from "../services/webrtc.service.mjs";
import { createLogger } from "../utils/logger.mjs";

const logger = createLogger("SignalingSocket");

export const setupSignalingSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: process.env.CLIENT_URL || "*",
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	// Socket.io namespace for WebRTC signaling
	const rtcNamespace = io.of("/webrtc");

	rtcNamespace.on("connection", async (socket) => {
		logger.info(`New WebRTC signaling connection: ${socket.id}`);

		// Get user from session or JWT token
		// This is just a simplified example - you should implement proper authentication
		let userId = null;

		// Authenticate socket connection
		socket.on("authenticate", async (data, callback) => {
			try {
				// In a real app, verify the token/session
				userId = data.userId;
				socket.join(userId);

				// Create router for this user
				const router = await webRTCService.createRouter(userId);

				// Get router RTP capabilities
				const rtpCapabilities = router.rtpCapabilities;

				logger.info(`Socket ${socket.id} authenticated as user ${userId}`);
				callback({ success: true, rtpCapabilities });
			} catch (error) {
				logger.error("Authentication error", error);
				callback({ success: false, error: error.message });
			}
		});

		// Create WebRTC transport
		socket.on("createWebRtcTransport", async (data, callback) => {
			logger.info(
				`Creating WebRTC transport for user ${userId}, direction: ${
					data.direction || "unknown"
				}`
			);
			try {
				if (!userId) {
					callback({ success: false, error: "Not authenticated" });
					return;
				}

				const router = await webRTCService.createRouter(userId);
				const transport = await webRTCService.createWebRtcTransport(
					userId,
					router
				);

				callback({ success: true, transport });
			} catch (error) {
				logger.error("Transport creation error", error);
				callback({ success: false, error: error.message });
			}
		});

		// Connect transport
		socket.on("connectTransport", async (data, callback) => {
			try {
				if (!userId) {
					callback({ success: false, error: "Not authenticated" });
					return;
				}

				const { transportId, dtlsParameters } = data;
				await webRTCService.connectTransport(
					userId,
					transportId,
					dtlsParameters
				);

				callback({ success: true });
			} catch (error) {
				logger.error("Transport connection error", error);
				callback({ success: false, error: error.message });
			}
		});

		// Create producer
		socket.on("produce", async (data, callback) => {
			logger.info(
				`Produce event received from user ${userId}, transportId: ${data.transportId}, kind: ${data.kind}`
			);
			try {
				if (!userId) {
					callback({ success: false, error: "Not authenticated" });
					return;
				}

				const { transportId, kind, rtpParameters } = data;
				const result = await webRTCService.createProducer(
					userId,
					transportId,
					kind,
					rtpParameters
				);

				callback({ success: true, producerId: result.id });
			} catch (error) {
				logger.error("Producer creation error", error);
				callback({ success: false, error: error.message });
			}
		});

		// End stream
		socket.on("endStream", () => {
			if (userId) {
				webRTCService.closeUserConnection(userId);
				logger.info(`Stream ended for user ${userId}`);
			}
		});

		// Handle disconnect
		socket.on("disconnect", () => {
			logger.info(`WebRTC signaling disconnected: ${socket.id}`);
			if (userId) {
				webRTCService.closeUserConnection(userId);
			}
		});

		socket.on("startStream", async (data, callback) => {
			try {
				if (!userId) {
					callback({ success: false, error: "Not authenticated" });
					return;
				}

				const { streamId } = data;
				logger.info(`Starting stream ${streamId} for user ${userId}`);

				// This will set up the RTMP streaming with the existing producers
				await webRTCService.setupRtmpStreaming(userId);

				callback({ success: true });
			} catch (error) {
				logger.error("Stream start error", error);
				callback({ success: false, error: error.message });
			}
		});
	});

	return io;
};
