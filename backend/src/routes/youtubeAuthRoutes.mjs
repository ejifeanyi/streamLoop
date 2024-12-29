import express from "express";
import passport from "passport";
import { isAuthenticated } from "../middlewares/auth.mjs";

const router = express.Router();

// Initiate YouTube OAuth flow
router.get(
	"/youtube",
	isAuthenticated,
	(req, res, next) => {
		// Store the return URL in session if provided
		if (req.query.returnTo) {
			req.session.returnTo = req.query.returnTo;
		}
		next();
	},
	passport.authenticate("youtube", {
		scope: ["https://www.googleapis.com/auth/youtube.force-ssl"],
		accessType: "offline",
		prompt: "consent",
	})
);

// YouTube OAuth callback
router.get(
	"/youtube/callback",
	passport.authenticate("youtube", {
		failureRedirect: "http://localhost:3000/accounts?error=auth_failed",
	}),
	(req, res) => {
		// Redirect to stored returnTo URL or default to accounts page
		const returnTo = req.session.returnTo || "http://localhost:3000/accounts";
		delete req.session.returnTo;
		res.redirect(`${returnTo}?connected=youtube`);
	}
);

export default router;
