import { WebSocketServer } from "ws";
import { parse } from "url";
import { spawn } from "child_process";
import { Readable } from "stream";

export function setupWebSocketServer(server) {
	const wss = new WebSocketServer({
		noServer: true,
		// verifyClient: (info, callback) => {
		// 	const origin = info.origin;
		// 	const allowedOrigin = process.env.CLIENT_URL;
		// 	callback(origin === allowedOrigin);
		// },
	});

	const streams = new Map();

	server.on("upgrade", (request, socket, head) => {
		console.log("Upgrade request headers:", request.headers);
		const { pathname } = parse(request.url || "");
		console.log("Upgrade request received for path:", pathname);

		if (pathname === "/ws") {
			console.log("Handling WebSocket upgrade");
			wss.handleUpgrade(request, socket, head, (ws) => {
				wss.emit("connection", ws, request);
			});
		} else {
			console.log("Invalid WebSocket path:", pathname);
			socket.destroy();
		}
	});

	wss.on("connection", (ws) => {
		console.log("New WebSocket connection established");
		let streamId = null;
		let ffmpeg = null;
		let inputStream = null;
		let rtmpUrl = null;
		let streamKey = null;

		ws.on("message", async (message) => {
			try {
				// Handle configuration message
				if (message.toString().startsWith("{")) {
					const config = JSON.parse(message.toString());
					if (config.type === "config") {
						streamId = config.streamId;
						rtmpUrl = config.rtmpUrl;
						streamKey = config.streamKey;

						// Create a readable stream for FFmpeg input
						inputStream = new Readable({
							read() {}, // This will be pushed to when we receive data
						});

						// Setup FFmpeg process
						ffmpeg = spawn("ffmpeg", [
							"-i",
							"pipe:0",
							"-c:v",
							"libx264",
							"-preset",
							"veryfast",
							"-b:v",
							"2500k",
							"-maxrate",
							"2500k",
							"-bufsize",
							"5000k",
							"-pix_fmt",
							"yuv420p",
							"-g",
							"60",
							"-r",
							"30",
							"-force_key_frames",
							"expr:gte(t,n_forced*2)",
							"-c:a",
							"aac",
							"-ar",
							"44100",
							"-b:a",
							"128k",
							"-ac",
							"2", // Add this
							"-shortest", // Add this
							"-f",
							"flv",
							`${rtmpUrl}/${streamKey}`,
						]);

						// Add error handlers
						ffmpeg.stderr.on("data", (data) => {
							console.log("FFmpeg:", data.toString());
						});

						ffmpeg.on("error", (error) => {
							console.error("FFmpeg error:", error);
							ws.close();
						});

						ffmpeg.on("close", (code) => {
							console.log(`FFmpeg process exited with code ${code}`);
							ws.close();
						});

						streams.set(streamId, {
							ws,
							ffmpeg,
							inputStream,
						});

						console.log(`Stream configured: ${streamId}`);
						console.log("🎥 RTMP URL:", rtmpUrl);
						console.log("🔑 Stream Key:", streamKey);
						return;
					}
				}

				// Handle binary video/audio data
				if (streamId && streams.has(streamId)) {
					console.log(
						`📥 Received data chunk of size: ${message.length} bytes`
					);
					const stream = streams.get(streamId);
					if (stream.inputStream) {
						stream.inputStream.push(message);
					}
				}
			} catch (error) {
				console.error("Error processing WebSocket message:", error);
			}
		});

		ws.on("close", () => {
			if (streamId && streams.has(streamId)) {
				const stream = streams.get(streamId);
				if (stream.ffmpeg) {
					stream.ffmpeg.kill("SIGKILL");
				}
				if (stream.inputStream) {
					stream.inputStream.push(null);
				}
				streams.delete(streamId);
				console.log(`Stream ended: ${streamId}`);
			}
		});

		ws.on("error", (error) => {
			console.error("WebSocket error:", error);
			if (streamId && streams.has(streamId)) {
				const stream = streams.get(streamId);
				if (stream.ffmpeg) {
					stream.ffmpeg.kill();
				}
				if (stream.inputStream) {
					stream.inputStream.push(null);
				}
				streams.delete(streamId);
			}
		});
	});

	return wss;
}
