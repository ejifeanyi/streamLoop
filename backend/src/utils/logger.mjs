// src/utils/logger.mjs
export const createLogger = (context) => {
	return {
		info: (message, data) =>
			console.log(`[${context}] INFO: ${message}`, data || ""),
		error: (message, data) =>
			console.error(`[${context}] ERROR: ${message}`, data || ""),
		debug: (message, data) =>
			console.debug(`[${context}] DEBUG: ${message}`, data || ""),
	};
};
