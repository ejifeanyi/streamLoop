import { PrismaClient, PlatformType } from "@prisma/client";

const prisma = new PrismaClient();

interface PlatformConnectionOptions {
	accessToken: string;
	refreshToken?: string;
	platformUserId: string;
	platformUsername?: string;
	permissions?: Record<string, any>;
}

class PlatformConnectionService {
	async connectPlatform(
		userId: string,
		platform: PlatformType,
		options: PlatformConnectionOptions
	) {
		// Check if platform is already connected
		const existingConnection = await prisma.platformAccount.findUnique({
			where: {
				userId_platform: {
					userId,
					platform,
				},
			},
		});

		if (existingConnection) {
			// Update existing connection
			return prisma.platformAccount.update({
				where: { id: existingConnection.id },
				data: {
					accessToken: options.accessToken,
					refreshToken: options.refreshToken,
					platformUsername: options.platformUsername,
					platformUserId: options.platformUserId,
					permissions: options.permissions,
					lastSyncedAt: new Date(),
					isActive: true,
				},
			});
		}

		// Create new platform connection
		return prisma.platformAccount.create({
			data: {
				userId,
				platform,
				platformUserId: options.platformUserId,
				platformUsername: options.platformUsername,
				accessToken: options.accessToken,
				refreshToken: options.refreshToken,
				permissions: options.permissions,
				isActive: true,
			},
		});
	}

	async disconnectPlatform(userId: string, platform: PlatformType) {
		return prisma.platformAccount.update({
			where: {
				userId_platform: {
					userId,
					platform,
				},
			},
			data: {
				isActive: false,
				accessToken: null,
				refreshToken: null,
			},
		});
	}

	async getUserPlatformAccounts(userId: string) {
		return prisma.platformAccount.findMany({
			where: {
				userId,
				isActive: true,
			},
			select: {
				id: true,
				platform: true,
				platformUsername: true,
				connectedAt: true,
			},
		});
	}
}

export default new PlatformConnectionService();
