import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import dotenv from "dotenv";
import configurePassport from "./config/passport.mjs";
import { configureYouTubeStrategy } from "./config/youtube.mjs";
import platformRoutes from "./routes/platformRoutes.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";

dotenv.config();

const app = express();

// CORS configuration - move before other middleware
// app.use(
// 	cors({
// 		origin: "http://localhost:3000",
// 		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
// 		credentials: true,
// 	})
// );

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		credentials: true,
		exposedHeaders: ["set-cookie"],
	})
);

// Basic middleware
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// Session configuration - added more secure settings
// app.use(
// 	session({
// 		secret: process.env.COOKIE_SECRET,
// 		resave: false,
// 		saveUninitialized: false,
// 		name: "sessionId",
// 		cookie: {
// 			maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days
// 			httpOnly: true,
// 			secure: process.env.NODE_ENV === "production",
// 			sameSite: "lax",
// 			path: "/",
// 			domain:
// 				process.env.NODE_ENV === "production" ? "your-domain.com" : "localhost",
// 		},
// 		proxy: process.env.NODE_ENV === "production", // Add this for production
// 	})
// );

app.use(
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: false,
		name: "sessionId",
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days
			httpOnly: true,
			secure: false, // Set to false for development
			sameSite: "lax",
			path: "/",
			domain: "localhost", // Remove the production check for now
		},
	})
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport
configurePassport();
configureYouTubeStrategy();

// Enhanced debug middleware
if (process.env.NODE_ENV !== "production") {
	app.use((req, res, next) => {
		console.log(`\n=== ${new Date().toISOString()} ===`);
		console.log(`${req.method} ${req.url}`);
		console.log("Session ID:", req.sessionID);
		console.log("Is Authenticated:", req.isAuthenticated());
		console.log("Session:", {
			...req.session,
			cookie: req.session?.cookie ? "Cookie present" : "No cookie",
		});
		console.log("User:", req.user || "No user");
		console.log("=================");
		next();
	});
}

// Authentication check middleware
const checkAuth = (req, res, next) => {
	if (!req.isAuthenticated()) {
		console.log("User not authenticated:", req.url);
		return res.status(401).json({ error: "Not authenticated" });
	}
	next();
};

// Health check route - move before other routes
app.get("/", (req, res) => {
	res.json({
		status: "ok",
		message: "Server is running",
		environment: process.env.NODE_ENV,
		authenticated: req.isAuthenticated(),
	});
});

// Routes
app.use("/auth", authRoutes);
app.use("/auth", platformRoutes);
app.use("/api", checkAuth, userRoutes);

// Error handling
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({
		error: "Internal server error",
		message: process.env.NODE_ENV === "development" ? err.message : undefined,
	});
});

// 404 handler - keep at the end
app.use((req, res) => {
	res.status(404).json({ error: "Not found" });
});

export default app;
