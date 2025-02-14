// src/routes/auth.routes.js
import express from "express";
import passport from "passport";
import { isAuthenticated, isNotAuthenticated } from "../middleware/auth.mjs";

const router = express.Router();

router.get("/check", (req, res) => {
	try {
		res.json({
			authenticated: req.isAuthenticated(),
			user: req.user
				? {
						id: req.user.id,
						email: req.user.email,
						name: req.user.name,
						picture: req.user.picture,
				  }
				: null,
		});
	} catch (error) {
		res.status(500).json({
			authenticated: false,
			error: "Internal server error",
		});
	}
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
		failureRedirect: `${process.env.CLIENT_URL}/`,
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
