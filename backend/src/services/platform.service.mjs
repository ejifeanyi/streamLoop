import { prisma } from "../utils/prisma.mjs";
import { youtubeOAuth2Client } from "../config/youtube.mjs";
import { refreshYouTubeToken } from "../config/youtube.mjs";

export class PlatformService {
	static async connectYouTubeAccount(userId, youtubeData) {
		try {
			if (!youtubeData?.tokens?.accessToken) {
				throw new Error("Missing required YouTube access token");
			}

			// Create or update the platform connection using Prisma
			const connection = await prisma.connectedAccount.upsert({
				where: {
					userId_platform: {
						userId: userId,
						platform: "YOUTUBE",
					},
				},
				update: {
					platformAccountId: youtubeData.id,
					accessToken: youtubeData.tokens.accessToken,
					refreshToken: youtubeData.tokens.refreshToken,
					tokenExpiresAt: new Date(youtubeData.tokens.expiryDate),
					platformUsername: youtubeData.channel.title,
					metadata: {
						channelId: youtubeData.id,
						title: youtubeData.channel.title,
						description: youtubeData.channel.description,
						statistics: youtubeData.channel.statistics,
						thumbnails: youtubeData.channel.thumbnails,
					},
				},
				create: {
					userId: userId,
					platform: "YOUTUBE",
					platformAccountId: youtubeData.id,
					accessToken: youtubeData.tokens.accessToken,
					refreshToken: youtubeData.tokens.refreshToken,
					tokenExpiresAt: new Date(youtubeData.tokens.expiryDate),
					platformUsername: youtubeData.channel.title,
					metadata: {
						channelId: youtubeData.id,
						title: youtubeData.channel.title,
						description: youtubeData.channel.description,
						statistics: youtubeData.channel.statistics,
						thumbnails: youtubeData.channel.thumbnails,
					},
				},
			});

			return connection;
		} catch (error) {
			console.error("Error connecting YouTube account:", error);
			throw error;
		}
	}

	static async getYouTubeClient(userId) {
		try {
			// Get the stored connection from Prisma
			const connection = await prisma.connectedAccount.findUnique({
				where: {
					userId_platform: {
						userId: userId,
						platform: "YOUTUBE",
					},
				},
			});

			if (!connection) {
				throw new Error("No YouTube connection found");
			}

			// Check if token needs refresh
			if (Date.now() >= connection.tokenExpiresAt.getTime()) {
				if (!connection.refreshToken) {
					throw new Error("No refresh token available");
				}

				const newTokens = await refreshYouTubeToken(connection.refreshToken);

				// Update the stored tokens
				await prisma.connectedAccount.update({
					where: {
						userId_platform: {
							userId: userId,
							platform: "YOUTUBE",
						},
					},
					data: {
						accessToken: newTokens.accessToken,
						tokenExpiresAt: new Date(newTokens.expiryDate),
					},
				});

				youtubeOAuth2Client.setCredentials({
					access_token: newTokens.accessToken,
					refresh_token: connection.refreshToken,
					expiry_date: newTokens.expiryDate,
				});
			} else {
				youtubeOAuth2Client.setCredentials({
					access_token: connection.accessToken,
					refresh_token: connection.refreshToken,
					expiry_date: connection.tokenExpiresAt.getTime(),
				});
			}

			return youtubeOAuth2Client;
		} catch (error) {
			console.error("Error getting YouTube client:", error);
			throw error;
		}
	}

	static async getConnectedAccounts(userId) {
		try {
			const accounts = await prisma.connectedAccount.findMany({
				where: {
					userId: userId,
				},
			});
			return accounts;
		} catch (error) {
			console.error("Error fetching connected accounts:", error);
			throw error;
		}
	}
}

export default PlatformService;
