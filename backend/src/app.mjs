// src/app.mjs
import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import { configurePassport } from "./config/passport.mjs";
import { configureYouTubeStrategy } from "./config/youtube.mjs";
import authRoutes from "./routes/auth.routes.mjs";
import platformRoutes from "./routes/platform.routes.mjs";
import streamRoutes from "./routes/stream.routes.mjs";
import { setupWebSocketServer } from "./websocket.mjs";
import { createServer } from "http";

// Create Express app and servers
const app = express();
const server = createServer(app); // For regular HTTP
const wsServer = createServer(); // For WebSocket

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
app.use("/stream", streamRoutes);

setupWebSocketServer(wsServer);

export { app, wsServer };
