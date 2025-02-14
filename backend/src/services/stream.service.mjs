import { prisma } from "../utils/prisma.mjs";
import { PlatformService } from "./platform.service.mjs";
import { google } from "googleapis";
import crypto from "crypto";

export class StreamService {
	static async createStream(userId, options) {
		const { title } = options;
		// We'll use the defaults from schema for these if not provided
		const quality = options.quality || "1080p";
		const bitrate = options.bitrate || 2500;
		const resolution = options.resolution || "1920x1080";
		const frameRate = options.frameRate || 30;

		try {
			// Get user's YouTube account
			const youtubeAccount = await prisma.connectedAccount.findFirst({
				where: {
					userId,
					platform: "YOUTUBE",
					isActive: true,
				},
			});

			if (!youtubeAccount) {
				throw new Error("No active YouTube account found");
			}

			// Generate a unique stream key
			const generatedStreamKey = crypto.randomBytes(16).toString("hex");
			const rtmpUrl = `rtmp://localhost:${process.env.RTMP_SERVER_PORT}/live`;

			// Create stream session
			const stream = await prisma.streamSession.create({
				data: {
					userId,
					title,
					quality,
					bitrate,
					resolution,
					frameRate,
					streamKey: generatedStreamKey,
					rtmpUrl,
					// status and startedAt will use schema defaults
					// youtubeData will use schema default of "{}"
					accounts: {
						connect: {
							id: youtubeAccount.id,
						},
					},
				},
			});

			return {
				...stream,
				rtmpUrl,
				streamKey: generatedStreamKey,
			};
		} catch (error) {
			console.error("Error creating stream:", error);
			throw error;
		}
	}

	static async startStream(userId, streamId) {
		// First get the stream data
		const stream = await prisma.streamSession.findFirst({
			where: {
				id: streamId,
				userId,
			},
			include: {
				accounts: true,
			},
		});

		if (!stream) {
			throw new Error("Stream not found");
		}

		// Update status to initializing
		await prisma.streamSession.update({
			where: { id: streamId },
			data: {
				status: "initializing",
			},
		});

		try {
			const youtubeClient = await PlatformService.getYouTubeClient(userId);
			const youtube = google.youtube({
				version: "v3",
				auth: youtubeClient,
			});

			const [broadcast, streamResponse] = await Promise.all([
				youtube.liveBroadcasts.insert({
					part: ["snippet", "contentDetails", "status"],
					requestBody: {
						snippet: {
							title: stream.title || "New Stream",
							scheduledStartTime: new Date().toISOString(),
						},
						contentDetails: {
							enableDvr: true,
							enableContentEncryption: true,
							enableEmbed: true,
							recordFromStart: true,
							startWithSlate: false,
						},
						status: {
							privacyStatus: "public",
							selfDeclaredMadeForKids: false,
						},
					},
				}),
				youtube.liveStreams.insert({
					part: ["snippet", "cdn", "contentDetails", "status"],
					requestBody: {
						snippet: {
							title: stream.title || "New Stream",
						},
						cdn: {
							frameRate: "variable", // Changed from stream.frameRate.toString()
							ingestionType: "rtmp",
							resolution: "variable", // Changed from stream.resolution
							ingestionInfo: {
								streamName: stream.streamKey,
								ingestionAddress: stream.rtmpUrl,
								backupIngestionAddress: stream.rtmpUrl,
							},
						},
						contentDetails: {
							isReusable: false,
						},
					},
				}),
			]);

			// Add debug logging
			console.log("YouTube broadcast data:", broadcast.data);
			console.log("YouTube stream data:", streamResponse.data);

			// Verify the binding
			const bindResponse = await youtube.liveBroadcasts.bind({
				part: ["id", "contentDetails"],
				id: broadcast.data.id,
				streamId: streamResponse.data.id,
			});

			console.log("Binding response:", bindResponse.data);

			// Update the stream session with YouTube data
			return await prisma.streamSession.update({
				where: { id: streamId },
				data: {
					status: "live",
					youtubeData: {
						broadcastId: broadcast.data.id,
						streamId: streamResponse.data.id,
						rtmpUrl: streamResponse.data.cdn.ingestionInfo.ingestionAddress,
						streamName: streamResponse.data.cdn.ingestionInfo.streamName,
					},
				},
			});
		} catch (error) {
			await prisma.streamSession.update({
				where: { id: streamId },
				data: {
					status: "error",
				},
			});
			console.error("Stream start error:", error);
			throw error;
		}
	}

	static async endStream(userId, streamId) {
		try {
			const stream = await prisma.streamSession.findFirst({
				where: {
					id: streamId,
					userId,
				},
				include: {
					accounts: true,
				},
			});

			if (!stream) {
				throw new Error("Stream not found");
			}

			// Get YouTube client and initialize API
			const youtubeClient = await PlatformService.getYouTubeClient(userId);
			const youtube = google.youtube({
				version: "v3",
				auth: youtubeClient,
			});

			// End the broadcast if it exists
			if (stream.youtubeData?.broadcastId) {
				await youtube.liveBroadcasts.transition({
					broadcastStatus: "complete",
					id: stream.youtubeData.broadcastId,
					part: ["id", "status"],
				});
			}

			// Update stream status
			return await prisma.streamSession.update({
				where: {
					id: streamId,
				},
				data: {
					status: "ended",
					endedAt: new Date(),
				},
			});
		} catch (error) {
			console.error("Error ending stream:", error);
			throw error;
		}
	}
}

export default StreamService;
