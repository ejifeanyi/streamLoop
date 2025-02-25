// src/app.mjs
import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import { configurePassport } from "./config/passport.mjs";
import { configureYouTubeStrategy } from "./config/youtube.mjs";
import { createServer } from "http";
import authRoutes from "./routes/auth.routes.mjs";
import platformRoutes from "./routes/platform.routes.mjs";
import streamRoutes from "./routes/stream.routes.mjs";
import { setupSignalingSocket } from "./socket/signaling.socket.mjs";

// Create Express app and servers
const app = express();
const server = createServer(app);

// Set up Socket.io for signaling
setupSignalingSocket(server);

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
);

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: false,
		name: "sessionId",
		cookie: {
			maxAge: 15 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());
configurePassport();
configureYouTubeStrategy();

app.get("/api/auth/status", (req, res) => {
	if (req.isAuthenticated()) {
		res.status(200).json({ authenticated: true });
	} else {
		res.status(401).json({ authenticated: false });
	}
});

app.use("/auth", authRoutes);
app.use("/platform", platformRoutes);
app.use("/api/stream", streamRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);
	res.status(500).json({ error: "Internal server error" });
});

export { app, server };
