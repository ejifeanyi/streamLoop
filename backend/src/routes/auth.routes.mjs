// src/routes/auth.routes.js
import express from "express";
import passport from "passport";
import { isAuthenticated, isNotAuthenticated } from "../middleware/auth.mjs";

const router = express.Router();

router.get("/check", (req, res) => {
	res.json({
		authenticated: req.isAuthenticated(),
		user: req.user,
	});
});

router.get(
	"/google",
	isNotAuthenticated,
	passport.authenticate("google", {
		scope: ["profile", "email"],
		accessType: "offline",
		prompt: "consent",
	})
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${process.env.CLIENT_URL}/login`,
		failureMessage: true,
	}),
	(req, res) => {
		res.redirect(process.env.CLIENT_URL);
	}
);

router.post("/logout", isAuthenticated, (req, res) => {
	req.logout((err) => {
		if (err) return res.status(500).json({ error: "Error logging out" });
		req.session.destroy((err) => {
			if (err)
				return res.status(500).json({ error: "Error destroying session" });
			res.clearCookie("sessionId");
			res.json({ message: "Logged out successfully" });
		});
	});
});

export default router;
