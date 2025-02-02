// src/services/storage.service.mjs
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createPresignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

export class StorageService {
	static s3Client = new S3Client({
		region: process.env.AWS_REGION,
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		},
	});

	static async storeChunk(stream, sessionId, chunkNumber, quality) {
		const key = `streams/${sessionId}/${quality}/chunk_${chunkNumber}.mp4`;

		try {
			const chunks = [];
			for await (const chunk of stream) {
				chunks.push(chunk);
			}
			const buffer = Buffer.concat(chunks);

			await this.s3Client.send(
				new PutObjectCommand({
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: key,
					Body: buffer,
					ContentType: "video/mp4",
				})
			);

			return key;
		} catch (error) {
			console.error(
				`Error storing chunk ${chunkNumber} for session ${sessionId}:`,
				error
			);
			throw error;
		}
	}

	static async getChunkUrl(sessionId, chunkNumber, quality) {
		const key = `streams/${sessionId}/${quality}/chunk_${chunkNumber}.mp4`;

		try {
			const command = new GetObjectCommand({
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: key,
			});

			// Create a URL that expires in 5 minutes
			return await createPresignedUrl(this.s3Client, command, {
				expiresIn: 300,
			});
		} catch (error) {
			console.error(`Error getting chunk URL for ${key}:`, error);
			throw error;
		}
	}

	static async deleteChunks(sessionId) {
		try {
			const listParams = {
				Bucket: process.env.AWS_BUCKET_NAME,
				Prefix: `streams/${sessionId}/`,
			};

			const objects = await this.s3Client.send(
				new ListObjectsV2Command(listParams)
			);

			if (objects.Contents?.length > 0) {
				await Promise.all(
					objects.Contents.map((obj) =>
						this.s3Client.send(
							new DeleteObjectCommand({
								Bucket: process.env.AWS_BUCKET_NAME,
								Key: obj.Key,
							})
						)
					)
				);
			}
		} catch (error) {
			console.error(`Error deleting chunks for session ${sessionId}:`, error);
			throw error;
		}
	}
}
