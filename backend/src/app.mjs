import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import dotenv from "dotenv";
import configurePassport from "./config/passport.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 15,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		},
	})
);

// Log session and cookie data
app.use((req, res, next) => {
	console.log("Session Data:", req.session);
	console.log("Cookies:", req.cookies);
	next();
});

// Passport setup
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/", userRoutes);

// Default Route
app.get("/", (req, res) => {
	res.send("Hello steamers");
});

export default app;
