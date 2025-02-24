import { prisma } from "../utils/prisma.mjs";
import { PlatformService } from "./platform.service.mjs";
import { google } from "googleapis";
import crypto from "crypto";

export class StreamService {
	static async createStream(userId, options) {
		const { title } = options;
		const quality = options.quality || "1080p";
		const bitrate = options.bitrate || 2500;
		const resolution = options.resolution || "1920x1080";
		const frameRate = options.frameRate || 30;

		try {
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

			const generatedStreamKey = crypto.randomBytes(16).toString("hex");
			const rtmpUrl = `rtmp://localhost:${process.env.RTMP_SERVER_PORT}/live`;

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
		let broadcast;
		let streamResponse;

		try {
			// Validate stream exists
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

			// Initialize YouTube client with fresh token
			const youtubeClient = await PlatformService.getYouTubeClient(userId);
			const youtube = google.youtube({
				version: "v3",
				auth: youtubeClient,
			});

			// Create broadcast and stream with error handling
			try {
				[broadcast, streamResponse] = await Promise.all([
					youtube.liveBroadcasts.insert({
						part: ["snippet", "contentDetails", "status"],
						requestBody: {
							snippet: {
								title: stream.title || "New Stream",
								scheduledStartTime: new Date().toISOString(),
								description: stream.description || "",
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
								frameRate: "variable",
								ingestionType: "rtmp",
								resolution: "variable",
							},
							contentDetails: {
								isReusable: false,
							},
						},
					}),
				]);
			} catch (error) {
				throw new Error(`Failed to create broadcast/stream: ${error.message}`);
			}

			// Bind broadcast and stream with error handling
			try {
				await youtube.liveBroadcasts.bind({
					part: ["id", "contentDetails"],
					id: broadcast.data.id,
					streamId: streamResponse.data.id,
				});
			} catch (error) {
				throw new Error(`Failed to bind broadcast to stream: ${error.message}`);
			}

			// Update stream session with initial data
			await prisma.streamSession.update({
				where: { id: streamId },
				data: {
					status: "ready",
					youtubeData: {
						broadcastId: broadcast.data.id,
						streamId: streamResponse.data.id,
						rtmpUrl: streamResponse.data.cdn.ingestionInfo.ingestionAddress,
						streamKey: streamResponse.data.cdn.ingestionInfo.streamName,
					},
				},
			});

			// Start monitoring process with improved error handling and logging
			(async () => {
				try {
					// Initial delay before health checks
					await new Promise((resolve) => setTimeout(resolve, 5000));

					// Monitor stream health
					const maxAttempts = 180; // 3 minutes total (changed from 120)
					const checkInterval = 1000; // 1 second between checks (changed from 2000)
					let attempts = 0;
					let streamHealth = "noData";

					console.log(`[Stream ${streamId}] Starting health monitoring...`);

					while (streamHealth === "noData" && attempts < maxAttempts) {
						try {
							const healthStatus = await youtube.liveStreams.list({
								part: ["status"],
								id: streamResponse.data.id,
							});

							streamHealth =
								healthStatus.data.items[0]?.status?.healthStatus?.status;
							console.log(
								`[Stream ${streamId}] Health check ${
									attempts + 1
								}/${maxAttempts}: ${streamHealth}`
							);

							if (streamHealth === "noData") {
								await new Promise((resolve) =>
									setTimeout(resolve, checkInterval)
								);
								attempts++;
							}
						} catch (error) {
							console.error(`[Stream ${streamId}] Health check error:`, error);
							attempts++;
							await new Promise((resolve) =>
								setTimeout(resolve, checkInterval)
							);
						}
					}

					if (streamHealth !== "good") {
						throw new Error(`Stream health check failed: ${streamHealth}`);
					}

					// Transition to testing
					console.log(`[Stream ${streamId}] Transitioning to testing state...`);
					await youtube.liveBroadcasts.transition({
						broadcastStatus: "testing",
						id: broadcast.data.id,
						part: ["id", "status"],
					});

					// Stabilization delay
					await new Promise((resolve) => setTimeout(resolve, 5000));

					// Transition to live
					console.log(`[Stream ${streamId}] Transitioning to live state...`);
					await youtube.liveBroadcasts.transition({
						broadcastStatus: "live",
						id: broadcast.data.id,
						part: ["id", "status"],
					});

					await prisma.streamSession.update({
						where: { id: streamId },
						data: {
							status: "live",
						},
					});

					console.log(
						`[Stream ${streamId}] Successfully transitioned to live state`
					);
				} catch (error) {
					console.error(
						`[Stream ${streamId}] Background process error:`,
						error
					);
					await prisma.streamSession.update({
						where: { id: streamId },
						data: {
							status: "error",
							errorMessage: error.message,
						},
					});
				}
			})();

			// Return initial stream details
			return {
				status: "ready",
				youtubeData: {
					broadcastId: broadcast.data.id,
					streamId: streamResponse.data.id,
					rtmpUrl: streamResponse.data.cdn.ingestionInfo.ingestionAddress,
					streamKey: streamResponse.data.cdn.ingestionInfo.streamName,
				},
			};
		} catch (error) {
			console.error(`[Stream ${streamId}] Start error:`, error);

			// Cleanup broadcast if created
			if (broadcast?.data?.id) {
				try {
					const youtubeClient = await PlatformService.getYouTubeClient(userId);
					const youtube = google.youtube({
						version: "v3",
						auth: youtubeClient,
					});

					await youtube.liveBroadcasts.transition({
						broadcastStatus: "complete",
						id: broadcast.data.id,
						part: ["id", "status"],
					});
				} catch (cleanupError) {
					console.error(`[Stream ${streamId}] Cleanup error:`, cleanupError);
				}
			}

			// Update stream status
			await prisma.streamSession.update({
				where: { id: streamId },
				data: {
					status: "error",
					errorMessage: error.message,
				},
			});

			throw new Error(`Failed to start stream: ${error.message}`);
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

			const youtubeClient = await PlatformService.getYouTubeClient(userId);
			const youtube = google.youtube({
				version: "v3",
				auth: youtubeClient,
			});

			if (stream.youtubeData?.broadcastId) {
				await youtube.liveBroadcasts.transition({
					broadcastStatus: "complete",
					id: stream.youtubeData.broadcastId,
					part: ["id", "status"],
				});
			}

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
