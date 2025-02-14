// src/middleware/auth.js
export const isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).json({ error: "Authentication required" });
};

export const isNotAuthenticated = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.status(400).json({ error: "Already authenticated" });
};

export const validatePlatform = (req, res, next) => {
	const { platform } = req.params;
	const supportedPlatforms = ["youtube", "twitch"]; // Add more as needed

	if (!supportedPlatforms.includes(platform)) {
		return res.status(400).json({ error: "Unsupported platform" });
	}
	next();
};
