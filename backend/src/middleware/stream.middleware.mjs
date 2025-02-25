// src/middleware/stream.middleware.mjs
import { createLogger } from "../utils/logger.mjs";

const logger = createLogger("StreamMiddleware");

export const validateStreamRequest = (req, res, next) => {
	// Validate that user is authenticated
	if (!req.isAuthenticated()) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	// Only require YouTube connection for YouTube-specific operations
	// For example, if the path contains 'youtube' or if there's a query param
	if (req.path.includes("/youtube") || req.query.platform === "youtube") {
		if (!req.user.youtube) {
			return res.status(403).json({ error: "YouTube account not connected" });
		}
	}

	next();
};
