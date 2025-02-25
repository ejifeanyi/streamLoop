// src/services/rtmp.service.mjs
import { spawn } from "child_process";
import { createLogger } from "../utils/logger.mjs";
import { rtmpConfig } from "../config/rtmp.config.mjs";
import fs from "fs";
import path from "path";
import os from "os";

const logger = createLogger("RTMPService");

class RTMPService {
	constructor() {
		this.streams = new Map();
		this.tempDir = path.join(os.tmpdir(), "stream-temp");

		// Ensure temp directory exists
		if (!fs.existsSync(this.tempDir)) {
			fs.mkdirSync(this.tempDir, { recursive: true });
		}
	}

	isStreaming(userId) {
		return this.streams.has(userId);
	}

	createFFmpegProcess(userId) {
		const outputUrl = `${rtmpConfig.server}/${userId}`;

		// Create input files for audio and video
		const videoInput = path.join(this.tempDir, `${userId}-video.raw`);
		const audioInput = path.join(this.tempDir, `${userId}-audio.raw`);

		// Create write streams for the input files
		const videoStream = fs.createWriteStream(videoInput);
		const audioStream = fs.createWriteStream(audioInput);

		// FFmpeg command to stream to RTMP server
		const ffmpeg = spawn("ffmpeg", [
			"-re",
			"-f",
			"rawvideo",
			"-pix_fmt",
			"yuv420p",
			"-s",
			"640x480",
			"-i",
			videoInput,
			"-f",
			"s16le",
			"-ar",
			"44100",
			"-ac",
			"2",
			"-i",
			audioInput,
			"-c:v",
			"libx264",
			"-preset",
			"veryfast",
			"-tune",
			"zerolatency",
			"-c:a",
			"aac",
			"-ar",
			"44100",
			"-b:a",
			"128k",
			"-f",
			"flv",
			outputUrl,
		]);

		ffmpeg.stdout.on("data", (data) => {
			logger.debug(`FFmpeg output: ${data}`);
		});

		ffmpeg.stderr.on("data", (data) => {
			logger.debug(`FFmpeg stderr: ${data}`);
		});

		ffmpeg.on("close", (code) => {
			logger.info(`FFmpeg process exited with code ${code}`);
			this.cleanup(userId);
		});

		return {
			process: ffmpeg,
			videoStream,
			audioStream,
		};
	}

	startStreaming(userId) {
		if (this.streams.has(userId)) {
			return this.streams.get(userId);
		}

		const ffmpegProcess = this.createFFmpegProcess(userId);
		this.streams.set(userId, ffmpegProcess);

		logger.info(`Started RTMP streaming for user ${userId}`);
		return ffmpegProcess;
	}

	processVideoData(userId, videoData) {
		const stream = this.streams.get(userId);
		if (!stream) return false;

		// stream.videoStream.write(Buffer.from(videoData));
		// return true;

		const producer = transport.produce({ kind, rtpParameters });

		// Add these debug logs
		logger.info(`Producer ${producer.id} (${kind}) created for user ${userId}`);

		// Log when we receive data
		producer.on("score", (score) => {
			logger.info(
				`Producer ${producer.id} score changed: ${JSON.stringify(score)}`
			);
		});

		// For testing if data is flowing (don't leave this in production)
		if (kind === "video") {
			let packetCount = 0;
			const logInterval = setInterval(() => {
				logger.info(
					`Producer ${producer.id} video stats: ${packetCount} packets received`
				);
				packetCount = 0;
			}, 5000);

			producer.observer.on("close", () => {
				clearInterval(logInterval);
			});

			// This might need tweaking based on your MediaSoup version
			producer.observer.on("rtp", () => {
				packetCount++;
			});
		}
	}

	processAudioData(userId, audioData) {
		const stream = this.streams.get(userId);
		if (!stream) return false;

		// stream.audioStream.write(Buffer.from(audioData));
		// return true;

		try {
			// Similar to video, you need to:
			// 1. Parse the RTP header
			// 2. Extract the payload
			// 3. Decode according to the codec (Opus usually)
			// 4. Convert to the raw format your FFmpeg expects

			// Simplified placeholder:
			const payload = audioData.slice(12); // Skip RTP header
			stream.audioStream.write(payload);
			return true;
		} catch (error) {
			logger.error(`Error processing audio data for user ${userId}`, error);
			return false;
		}
	}

	stopStreaming(userId) {
		const stream = this.streams.get(userId);
		if (stream) {
			stream.process.kill("SIGINT");
			stream.videoStream.end();
			stream.audioStream.end();
			this.streams.delete(userId);
			logger.info(`Stopped RTMP streaming for user ${userId}`);
		}
	}

	cleanup(userId) {
		// Remove temporary files
		const videoInput = path.join(this.tempDir, `${userId}-video.raw`);
		const audioInput = path.join(this.tempDir, `${userId}-audio.raw`);

		if (fs.existsSync(videoInput)) fs.unlinkSync(videoInput);
		if (fs.existsSync(audioInput)) fs.unlinkSync(audioInput);

		logger.info(`Cleaned up temporary files for user ${userId}`);
	}
}

export const rtmpService = new RTMPService();
