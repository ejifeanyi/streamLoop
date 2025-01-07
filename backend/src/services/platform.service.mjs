// src/services/platform.service.js
import { prisma } from "../utils/prisma.mjs";
import { google } from "googleapis";

export class PlatformService {
	static async connectYouTubeAccount(userId, youtubeData) {
		return prisma.connectedAccount.upsert({
			where: {
				userId_platform_accountId: {
					userId,
					platform: "youtube",
					accountId: youtubeData.channelId,
				},
			},
			update: {
				accessToken: youtubeData.accessToken,
				refreshToken: youtubeData.refreshToken,
				channelData: {
					title: youtubeData.channelTitle,
					statistics: youtubeData.channelStats,
				},
				tokenExpiry: new Date(Date.now() + 3600 * 1000),
			},
			create: {
				userId,
				platform: "youtube",
				accountId: youtubeData.channelId,
				accessToken: youtubeData.accessToken,
				refreshToken: youtubeData.refreshToken,
				channelData: {
					title: youtubeData.channelTitle,
					statistics: youtubeData.channelStats,
				},
				tokenExpiry: new Date(Date.now() + 3600 * 1000),
			},
		});
	}

	static async getConnectedAccounts(userId) {
		return prisma.connectedAccount.findMany({
			where: { userId },
		});
	}

	static async refreshYouTubeToken(connectedAccount) {
		const oauth2Client = new google.auth.OAuth2(
			process.env.YOUTUBE_CLIENT_ID,
			process.env.YOUTUBE_CLIENT_SECRET
		);

		oauth2Client.setCredentials({
			refresh_token: connectedAccount.refreshToken,
		});

		const { tokens } = await oauth2Client.refreshAccessToken();

		return prisma.connectedAccount.update({
			where: { id: connectedAccount.id },
			data: {
				accessToken: tokens.access_token,
				tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
			},
		});
	}
}
