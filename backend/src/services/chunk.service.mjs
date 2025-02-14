// src/services/chunk.service.mjs
import { prisma } from "../utils/prisma.mjs";

export class ChunkService {
	static async trackChunk(sessionId, chunkNumber, quality, duration) {
		try {
			return await prisma.streamChunk.create({
				data: {
					sessionId,
					chunkNumber,
					quality,
					duration,
					status: "processed",
				},
			});
		} catch (error) {
			console.error(`Error tracking chunk for session ${sessionId}:`, error);
			throw error;
		}
	}

	static async getChunkStatus(sessionId, chunkNumber, quality) {
		try {
			return await prisma.streamChunk.findFirst({
				where: {
					sessionId,
					chunkNumber,
					quality,
				},
			});
		} catch (error) {
			console.error(
				`Error getting chunk status for session ${sessionId}:`,
				error
			);
			throw error;
		}
	}
}
