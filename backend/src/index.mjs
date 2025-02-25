// src/index.mjs
import dotenv from "dotenv";
import { app, server } from "./app.mjs";
import NodeMediaServer from "node-media-server";

dotenv.config();

const nmsConfig = {
	rtmp: {
		port: 1935,
		chunk_size: 60000,
		gop_cache: true,
		ping: 30,
		ping_timeout: 60,
	},
};

const nms = new NodeMediaServer(nmsConfig);

async function startServer() {
	try {
		// Start RTMP server
		nms.run();
		console.log("RTMP server running on port 1935");

		// Start Express server with integrated HTTP and WebSocket
		const HTTP_PORT = process.env.PORT || 5000;
		server.listen(HTTP_PORT, () => {
			console.log(`Server running on port ${HTTP_PORT} (HTTP and WebSocket)`);
		});

		// Log successful startup
		console.log("All servers started successfully");
	} catch (error) {
		console.error("Failed to start servers:", error);
		process.exit(1);
	}
}

startServer().catch((error) => {
	console.error("Startup error:", error);
	process.exit(1);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
	console.log("SIGTERM signal received: closing servers");
	nms.stop();
	server.close(() => {
		console.log("HTTP/WebSocket server closed");
		process.exit(0);
	});
});

process.on("SIGINT", () => {
	console.log("SIGINT signal received: closing servers");
	nms.stop();
	server.close(() => {
		console.log("HTTP/WebSocket server closed");
		process.exit(0);
	});
});
