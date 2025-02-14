import dotenv from "dotenv";
import { app, wsServer } from "./app.mjs";
import nms from "./rtmp-server.mjs";

dotenv.config();

async function startServer() {
	try {
		// Start RTMP server
		nms.run();
		console.log("RTMP server running on port 1935");

		// Start Express server for HTTP/Auth
		const HTTP_PORT = process.env.PORT || 5000;
		app.listen(HTTP_PORT, () => {
			console.log(`Express server running on port ${HTTP_PORT}`);
		});

		// Start WebSocket server on different port
		const WS_PORT = process.env.WS_PORT || 5001;
		wsServer.listen(WS_PORT, () => {
			console.log(`WebSocket server running on port ${WS_PORT}`);
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
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("SIGINT signal received: closing servers");
	nms.stop();
	process.exit(0);
});
