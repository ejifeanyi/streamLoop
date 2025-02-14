// src/services/media.service.mjs
import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";

export class MediaService {
	static CHUNK_DURATION = 1; // 1 second chunks
	static QUALITIES = {
		high: {
			resolution: "1920x1080",
			bitrate: "2500k",
			fps: 30,
		},
		medium: {
			resolution: "1280x720",
			bitrate: "1500k",
			fps: 30,
		},
		low: {
			resolution: "854x480",
			bitrate: "800k",
			fps: 24,
		},
	};

	static async processStreamChunk(inputStream, sessionId, quality = "high") {
		const outputStream = new PassThrough();
		const qualitySettings = this.QUALITIES[quality];

		try {
			ffmpeg(inputStream)
				.videoCodec("libx264")
				.audioCodec("aac")
				.size(qualitySettings.resolution)
				.videoBitrate(qualitySettings.bitrate)
				.fps(qualitySettings.fps)
				.outputFormat("mp4")
				.outputOptions([
					"-movflags frag_keyframe+empty_moov+default_base_moof",
					`-g ${qualitySettings.fps * this.CHUNK_DURATION}`, // GOP size
					"-bf 2", // Maximum 2 B-frames
					"-preset ultrafast",
					"-tune zerolatency",
				])
				.on("error", (err) => {
					console.error(
						`Error processing chunk for session ${sessionId}:`,
						err
					);
					outputStream.emit("error", err);
				})
				.pipe(outputStream);

			return outputStream;
		} catch (error) {
			console.error(`Failed to process chunk for session ${sessionId}:`, error);
			throw error;
		}
	}

	static createManifest(streamId, availableQualities) {
		const manifest = {
			streamId,
			qualities: availableQualities.map((quality) => ({
				name: quality,
				...this.QUALITIES[quality],
				url: `/stream/${streamId}/quality/${quality}/manifest.m3u8`,
			})),
		};
		return manifest;
	}
}
