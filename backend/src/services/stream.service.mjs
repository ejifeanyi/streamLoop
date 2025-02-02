// src/services/stream.service.mjs
import { prisma } from "../utils/prisma.mjs";
import { google } from "googleapis";
import { youtubeOAuth2Client } from "../config/youtube.mjs";

export class StreamService {
	static async createStreamSession(userId, streamData) {
		try {
			// Create a new stream session
			const session = await prisma.streamSession.create({
				data: {
					userId,
					title: streamData.title,
					quality: streamData.quality || "1080p",
					bitrate: streamData.bitrate || 2500,
					resolution: streamData.resolution || "1920x1080",
					frameRate: streamData.frameRate || 30,
					status: "created",
					// Generate a unique stream key
					streamKey: `live_${userId}_${Date.now()}`,
					// Your RTMP server URL
					rtmpUrl: `rtmp://${process.env.RTMP_SERVER}/live`,
					platforms: streamData.platforms || {},
					...(streamData.accountIds?.length > 0 && {
						accounts: {
							connect: streamData.accountIds.map((id) => ({ id })),
						},
					}),
				},
				include: {
					accounts: true,
				},
			});

			// Only initialize platform streams if there are connected accounts
			if (session.accounts?.length > 0) {
				await Promise.all(
					session.accounts.map((account) =>
						this.initializePlatformStream(account, session)
					)
				);
			}

			return session;
		} catch (error) {
			console.error("Error creating stream session:", error);
			throw error;
		}
	}

	static async initializePlatformStream(account, session) {
		switch (account.platform) {
			case "YOUTUBE":
				return await this.initializeYouTubeStream(account, session);
			// Add cases for other platforms
			default:
				throw new Error(`Unsupported platform: ${account.platform}`);
		}
	}

	static async initializeYouTubeStream(account, session) {
		try {
			const youtube = google.youtube({
				version: "v3",
				auth: youtubeOAuth2Client,
			});

			// Set credentials for the account
			youtubeOAuth2Client.setCredentials({
				access_token: account.accessToken,
				refresh_token: account.refreshToken,
			});

			// Create YouTube broadcast
			const broadcast = await youtube.liveBroadcasts.insert({
				part: ["snippet", "contentDetails", "status"],
				requestBody: {
					snippet: {
						title: session.title,
						scheduledStartTime: new Date().toISOString(),
					},
					contentDetails: {
						enableAutoStart: true,
						enableAutoEnd: true,
					},
					status: {
						privacyStatus: "public",
						selfDeclaredMadeForKids: false,
					},
				},
			});

			// Create YouTube stream
			const stream = await youtube.liveStreams.insert({
				part: ["snippet", "cdn"],
				requestBody: {
					snippet: {
						title: session.title,
					},
					cdn: {
						frameRate: session.frameRate.toString(),
						ingestionType: "rtmp",
						resolution: session.resolution,
					},
				},
			});

			// Bind broadcast to stream
			await youtube.liveBroadcasts.bind({
				id: broadcast.data.id,
				part: ["id", "contentDetails"],
				streamId: stream.data.id,
			});

			// Update session with YouTube-specific details
			const platforms = {
				...session.platforms,
				youtube: {
					broadcastId: broadcast.data.id,
					streamId: stream.data.id,
					streamUrl: stream.data.cdn.ingestionInfo.ingestionAddress,
					streamKey: stream.data.cdn.ingestionInfo.streamName,
				},
			};

			await prisma.streamSession.update({
				where: { id: session.id },
				data: { platforms },
			});

			return { broadcast: broadcast.data, stream: stream.data };
		} catch (error) {
			console.error("Error initializing YouTube stream:", error);
			throw error;
		}
	}

	static async startStream(sessionId) {
		try {
			const session = await prisma.streamSession.update({
				where: { id: sessionId },
				data: {
					status: "live",
					startedAt: new Date(),
				},
				include: { accounts: true },
			});

			// Start streaming on each platform
			await Promise.all(
				session.accounts.map((account) =>
					this.startPlatformStream(account, session)
				)
			);

			return session;
		} catch (error) {
			console.error("Error starting stream:", error);
			throw error;
		}
	}

	static async startPlatformStream(account, session) {
		switch (account.platform) {
			case "YOUTUBE":
				const youtube = google.youtube({
					version: "v3",
					auth: youtubeOAuth2Client,
				});
				const broadcastId = session.platforms.youtube.broadcastId;

				await youtube.liveBroadcasts.transition({
					broadcastStatus: "live",
					id: broadcastId,
					part: ["id", "status"],
				});
				break;
			// Add cases for other platforms
		}
	}

	static async endStream(sessionId) {
		try {
			const session = await prisma.streamSession.update({
				where: { id: sessionId },
				data: {
					status: "ended",
					endedAt: new Date(),
				},
				include: { accounts: true },
			});

			// End streaming on each platform
			await Promise.all(
				session.accounts.map((account) =>
					this.endPlatformStream(account, session)
				)
			);

			return session;
		} catch (error) {
			console.error("Error ending stream:", error);
			throw error;
		}
	}

	static async endPlatformStream(account, session) {
		switch (account.platform) {
			case "YOUTUBE":
				const youtube = google.youtube({
					version: "v3",
					auth: youtubeOAuth2Client,
				});
				const broadcastId = session.platforms.youtube.broadcastId;

				await youtube.liveBroadcasts.transition({
					broadcastStatus: "complete",
					id: broadcastId,
					part: ["id", "status"],
				});
				break;
			// Add cases for other platforms
		}
	}
}
