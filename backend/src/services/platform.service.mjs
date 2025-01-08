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

	static async connectTwitchAccount(userId, twitchData) {
		return prisma.connectedAccount.upsert({
			where: {
				userId_platform_accountId: {
					userId,
					platform: "twitch",
					accountId: twitchData.channelId,
				},
			},
			update: {
				accessToken: twitchData.accessToken,
				refreshToken: twitchData.refreshToken,
				channelData: twitchData.channelData,
				tokenExpiry: new Date(Date.now() + 3600 * 1000),
			},
			create: {
				userId,
				platform: "twitch",
				accountId: twitchData.channelId,
				accessToken: twitchData.accessToken,
				refreshToken: twitchData.refreshToken,
				channelData: twitchData.channelData,
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

	static async refreshTwitchToken(connectedAccount) {
		const params = new URLSearchParams({
			client_id: process.env.TWITCH_CLIENT_ID,
			client_secret: process.env.TWITCH_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: connectedAccount.refreshToken,
		});

		const response = await fetch(`https://id.twitch.tv/oauth2/token`, {
			method: "POST",
			body: params,
		});

		if (!response.ok) throw new Error("Failed to refresh Twitch token");

		const tokens = await response.json();

		return prisma.connectedAccount.update({
			where: { id: connectedAccount.id },
			data: {
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token,
				tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
			},
		});
	}
}
