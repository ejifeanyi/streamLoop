// src/services/webrtc.service.mjs
import mediasoup from "mediasoup";
import { createLogger } from "../utils/logger.mjs";
import { webRTCConfig } from "../config/webrtc.config.mjs";
import { rtmpService } from "./rtmp.service.mjs";

const logger = createLogger("WebRTCService");

class WebRTCService {
	constructor() {
		this.workers = new Map();
		this.routers = new Map();
		this.producers = new Map();
		this.consumers = new Map();
		this.transports = new Map();

		this.initializeWorkers();
	}

	async initializeWorkers() {
		// Create a mediasoup worker
		try {
			const worker = await mediasoup.createWorker({
				logLevel: "warn",
				logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
			});

			worker.on("died", () => {
				logger.error("mediasoup worker died, exiting in 2 seconds...");
				setTimeout(() => process.exit(1), 2000);
			});

			this.worker = worker;
			logger.info("mediasoup worker created");
		} catch (error) {
			logger.error("Failed to create mediasoup worker", error);
			throw error;
		}
	}

	async createRouter(userId) {
		if (this.routers.has(userId)) {
			return this.routers.get(userId);
		}

		try {
			// Media codecs for the router
			const mediaCodecs = [
				{
					kind: "audio",
					mimeType: "audio/opus",
					clockRate: 48000,
					channels: 2,
				},
				{
					kind: "video",
					mimeType: "video/VP8",
					clockRate: 90000,
					parameters: {
						"x-google-start-bitrate": 1000,
					},
				},
				{
					kind: "video",
					mimeType: "video/H264",
					clockRate: 90000,
					parameters: {
						"packetization-mode": 1,
						"profile-level-id": "42e01f",
						"level-asymmetry-allowed": 1,
					},
				},
			];

			const router = await this.worker.createRouter({ mediaCodecs });
			this.routers.set(userId, router);

			logger.info(`Router created for user ${userId}`);
			return router;
		} catch (error) {
			logger.error(`Error creating router for user ${userId}`, error);
			throw error;
		}
	}

	async createWebRtcTransport(userId, router) {
		try {
			const transport = await router.createWebRtcTransport({
				listenIps: [
					{
						ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
						announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || null, // Set this to your public IP in production
					},
				],
				enableUdp: true,
				enableTcp: true,
				preferUdp: true,
				initialAvailableOutgoingBitrate: 1000000,
			});

			transport.on("icestatechange", (iceState) => {
				logger.info(`ICE state changed to ${iceState} for user ${userId}`);
			});

			transport.on("dtlsstatechange", (dtlsState) => {
				if (dtlsState === "closed") {
					this.closeTransport(transport.id);
				}
			});

			// Store the transport
			if (!this.transports.has(userId)) {
				this.transports.set(userId, new Map());
			}
			this.transports.get(userId).set(transport.id, transport);

			return {
				id: transport.id,
				iceParameters: transport.iceParameters,
				iceCandidates: transport.iceCandidates,
				dtlsParameters: transport.dtlsParameters,
			};
		} catch (error) {
			logger.error(`Error creating WebRTC transport for user ${userId}`, error);
			throw error;
		}
	}

	async connectTransport(userId, transportId, dtlsParameters) {
		try {
			const userTransports = this.transports.get(userId);
			if (!userTransports) {
				throw new Error(`No transports found for user ${userId}`);
			}

			const transport = userTransports.get(transportId);
			if (!transport) {
				throw new Error(`Transport ${transportId} not found`);
			}

			await transport.connect({ dtlsParameters });
			logger.info(`Transport ${transportId} connected for user ${userId}`);

			return { success: true };
		} catch (error) {
			logger.error(`Error connecting transport for user ${userId}`, error);
			throw error;
		}
	}

	async createProducer(userId, transportId, kind, rtpParameters) {
		try {
			const userTransports = this.transports.get(userId);
			if (!userTransports) {
				throw new Error(`No transports found for user ${userId}`);
			}

			const transport = userTransports.get(transportId);
			if (!transport) {
				throw new Error(`Transport ${transportId} not found`);
			}

			const producer = await transport.produce({ kind, rtpParameters });

			producer.on("transportclose", () => {
				this.closeProducer(producer.id);
			});

			// Store the producer
			if (!this.producers.has(userId)) {
				this.producers.set(userId, new Map());
			}
			this.producers.get(userId).set(producer.id, producer);

			// Start RTMP streaming when both audio and video producers are ready
			this.setupRtmpStreaming(userId);

			logger.info(
				`Producer ${producer.id} (${kind}) created for user ${userId}`
			);

			// Add these debug logs
			logger.info(
				`Producer ${producer.id} (${kind}) created for user ${userId}`
			);

			// Log when we receive data
			producer.on("score", (score) => {
				logger.info(
					`Producer ${producer.id} score changed: ${JSON.stringify(score)}`
				);
			});

			// For testing if data is flowing (don't leave this in production)
			if (kind === "video") {
				let packetCount = 0;
				const logInterval = setInterval(() => {
					logger.info(
						`Producer ${producer.id} video stats: ${packetCount} packets received`
					);
					packetCount = 0;
				}, 5000);

				producer.observer.on("close", () => {
					clearInterval(logInterval);
				});

				// This might need tweaking based on your MediaSoup version
				producer.observer.on("rtp", () => {
					packetCount++;
				});
			}

			return { id: producer.id };
		} catch (error) {
			logger.error(`Error creating producer for user ${userId}`, error);
			throw error;
		}
	}

	async setupRtmpStreaming(userId) {
		const userProducers = this.producers.get(userId);
		if (!userProducers) return;

		// Check if we have both audio and video producers
		let hasAudio = false;
		let hasVideo = false;

		for (const producer of userProducers.values()) {
			if (producer.kind === "audio") hasAudio = true;
			if (producer.kind === "video") hasVideo = true;
		}

		if (hasAudio && hasVideo && !rtmpService.isStreaming(userId)) {
			// Start RTMP streaming for this user
			rtmpService.startStreaming(userId);

			// Set up consumers to receive the media for RTMP
			// This would depend on your specific RTMP implementation
			logger.info(`RTMP streaming started for user ${userId}`);
		}
	}

	closeProducer(producerId) {
		// Find and close the producer
		for (const [userId, userProducers] of this.producers.entries()) {
			if (userProducers.has(producerId)) {
				const producer = userProducers.get(producerId);
				producer.close();
				userProducers.delete(producerId);

				logger.info(`Producer ${producerId} closed for user ${userId}`);

				// If user has no more producers, stop RTMP streaming
				if (userProducers.size === 0) {
					rtmpService.stopStreaming(userId);
				}

				return;
			}
		}
	}

	closeTransport(transportId) {
		// Find and close the transport
		for (const [userId, userTransports] of this.transports.entries()) {
			if (userTransports.has(transportId)) {
				const transport = userTransports.get(transportId);
				transport.close();
				userTransports.delete(transportId);

				logger.info(`Transport ${transportId} closed for user ${userId}`);
				return;
			}
		}
	}

	closeUserConnection(userId) {
		// Close all producers
		if (this.producers.has(userId)) {
			for (const producer of this.producers.get(userId).values()) {
				producer.close();
			}
			this.producers.delete(userId);
		}

		// Close all transports
		if (this.transports.has(userId)) {
			for (const transport of this.transports.get(userId).values()) {
				transport.close();
			}
			this.transports.delete(userId);
		}

		// Stop RTMP streaming
		rtmpService.stopStreaming(userId);

		logger.info(`Closed all connections for user ${userId}`);
	}

	// Add this to webrtc.service.mjs

	async setupRtmpStreaming(userId) {
		const userProducers = this.producers.get(userId);
		if (!userProducers) return;

		// Check if we have both audio and video producers
		let audioProducer = null;
		let videoProducer = null;

		for (const producer of userProducers.values()) {
			if (producer.kind === "audio") audioProducer = producer;
			if (producer.kind === "video") videoProducer = producer;
		}

		if (audioProducer && videoProducer && !rtmpService.isStreaming(userId)) {
			logger.info(`Starting RTMP streaming for user ${userId}`);

			// Start RTMP process
			const rtmpProcess = rtmpService.startStreaming(userId);

			// Create server-side consumer for these producers
			const router = this.routers.get(userId);
			if (!router) {
				logger.error(`Router not found for user ${userId}`);
				return;
			}

			// Create a transport for consuming media
			const consumerTransport = await router.createPlainTransport({
				listenIp: { ip: "127.0.0.1", announcedIp: null },
				rtcpMux: true,
				comedia: true,
			});

			// Store the consumer transport
			if (!this.consumers.has(userId)) {
				this.consumers.set(userId, new Map());
			}

			// Consume audio
			const audioConsumer = await consumerTransport.consume({
				producerId: audioProducer.id,
				rtpCapabilities: router.rtpCapabilities,
				paused: false,
			});

			// Consume video
			const videoConsumer = await consumerTransport.consume({
				producerId: videoProducer.id,
				rtpCapabilities: router.rtpCapabilities,
				paused: false,
			});

			// Store the consumers
			this.consumers.get(userId).set(audioConsumer.id, audioConsumer);
			this.consumers.get(userId).set(videoConsumer.id, videoConsumer);

			// Set up RTP listeners to relay data to RTMP
			audioConsumer.observer.on("rtp", (packet) => {
				rtmpService.processAudioData(userId, packet.data);
			});

			videoConsumer.observer.on("rtp", (packet) => {
				rtmpService.processVideoData(userId, packet.data);
			});

			// Event handlers for the consumers
			audioConsumer.on("transportclose", () => {
				this.closeConsumer(audioConsumer.id);
			});

			videoConsumer.on("transportclose", () => {
				this.closeConsumer(videoConsumer.id);
			});

			logger.info(`RTMP streaming setup complete for user ${userId}`);
		}
	}

	// Add this method as well
	closeConsumer(consumerId) {
		// Find and close the consumer
		for (const [userId, userConsumers] of this.consumers.entries()) {
			if (userConsumers.has(consumerId)) {
				const consumer = userConsumers.get(consumerId);
				consumer.close();
				userConsumers.delete(consumerId);

				logger.info(`Consumer ${consumerId} closed for user ${userId}`);
				return;
			}
		}
	}
}

export const webRTCService = new WebRTCService();
