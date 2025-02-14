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
			const account = await prisma.connectedAccount.findUnique({
				where: {
					userId_platform: {
						userId: userId,
						platform: "YOUTUBE",
					},
				},
			});

			if (!account) {
				throw new Error("No active YouTube account found");
			}

			console.log("Current token expiry:", account.tokenExpiry);
			console.log("Current time:", new Date());

			// Check if token needs refresh
			const now = new Date();
			if (!account.tokenExpiry || now >= account.tokenExpiry) {
				console.log("Token needs refresh");

				if (!account.refreshToken) {
					throw new Error("No refresh token available");
				}

				console.log("Starting token refresh with refresh token");
				const newTokens = await refreshYouTubeToken(account.refreshToken);

				console.log("New tokens received:", {
					hasAccessToken: !!newTokens.accessToken,
					expiryDate: newTokens.expiryDate,
					expiresIn: newTokens.expiresIn,
				});

				// Calculate expiry date directly instead of using the one from newTokens
				const tokenExpiry = new Date(Date.now() + newTokens.expiresIn * 1000);

				console.log("Calculated token expiry:", tokenExpiry);
				console.log("Is valid date:", !isNaN(tokenExpiry.getTime()));

				if (isNaN(tokenExpiry.getTime())) {
					console.error("Invalid date calculation:", {
						now: Date.now(),
						expiresIn: newTokens.expiresIn,
						calculation: Date.now() + newTokens.expiresIn * 1000,
					});
					throw new Error("Invalid expiry date generated");
				}

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
						tokenExpiry: tokenExpiry,
						lastRefresh: new Date(),
					},
				});

				youtubeOAuth2Client.setCredentials({
					access_token: newTokens.accessToken,
					refresh_token: account.refreshToken,
					expiry_date: tokenExpiry.getTime(),
				});

				console.log("Credentials updated successfully");
			} else {
				console.log("Using existing token");
				youtubeOAuth2Client.setCredentials({
					access_token: account.accessToken,
					refresh_token: account.refreshToken,
					expiry_date: account.tokenExpiry.getTime(),
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

	static async disconnectPlatform(userId, platform) {
		try {
			const result = await prisma.connectedAccount.delete({
				where: {
					userId_platform: {
						userId: userId,
						platform: platform,
					},
				},
			});
			return result;
		} catch (error) {
			console.error(`Error disconnecting ${platform} account:`, error);
			throw error;
		}
	}

	static async togglePlatformStatus(userId, accountId, isActive) {
		try {
			// First verify the account belongs to the user
			const account = await prisma.connectedAccount.findFirst({
				where: {
					id: accountId,
					userId: userId,
				},
			});

			if (!account) {
				throw new Error("Account not found or unauthorized");
			}

			// Update the account status
			const updatedAccount = await prisma.connectedAccount.update({
				where: {
					id: accountId,
				},
				data: {
					isActive: isActive,
				},
			});

			return updatedAccount;
		} catch (error) {
			console.error("Error toggling platform status:", error);
			throw error;
		}
	}
}

export default PlatformService;
