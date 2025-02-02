// src/services/cleanup.service.mjs
import { prisma } from "../utils/prisma.mjs";
import { StorageService } from "./storage.service.mjs";

export class CleanupService {
	static RETENTION_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

	static async scheduleCleanup() {
		setInterval(async () => {
			await this.cleanupOldSessions();
		}, 60 * 60 * 1000); // Run every hour
	}

	static async cleanupOldSessions() {
		const cutoffDate = new Date(Date.now() - this.RETENTION_PERIOD);

		try {
			const oldSessions = await prisma.streamSession.findMany({
				where: {
					endedAt: {
						lt: cutoffDate,
					},
				},
			});

			for (const session of oldSessions) {
				await Promise.all([
					StorageService.deleteChunks(session.id),
					prisma.streamChunk.deleteMany({
						where: { sessionId: session.id },
					}),
					prisma.streamSession.delete({
						where: { id: session.id },
					}),
				]);
			}
		} catch (error) {
			console.error("Error cleaning up old sessions:", error);
		}
	}
}
