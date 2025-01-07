// src/app.js
import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import { configurePassport } from "./config/passport.mjs";
import { configureYouTubeStrategy } from "./config/youtube.mjs";
import authRoutes from "./routes/auth.routes.mjs";
import platformRoutes from "./routes/platform.routes.mjs";

const app = express();

// Middleware
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
		exposedHeaders: ["set-cookie"],
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
			maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		},
	})
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
configurePassport();
configureYouTubeStrategy();

// Routes
app.use("/auth", authRoutes);
app.use("/auth", platformRoutes);

// Error handling
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: err.message });
});

export default app;
