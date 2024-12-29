import express from "express";
import passport from "passport";

const router = express.Router();

// Add the check endpoint
router.get("/check", (req, res) => {
	console.log("Auth Check - Session:", req.session);
	console.log("Auth Check - Is Authenticated:", req.isAuthenticated());
	console.log("Auth Check - User:", req.user);

	if (req.isAuthenticated()) {
		res.json({
			authenticated: true,
			user: req.user,
			session: req.session,
		});
	} else {
		res.json({
			authenticated: false,
			session: req.session,
		});
	}
});

// Update the /me endpoint to include more logging
router.get("/me", (req, res) => {
	console.log("Me Endpoint - Session:", req.session);
	console.log("Me Endpoint - Is Authenticated:", req.isAuthenticated());
	console.log("Me Endpoint - User:", req.user);

	if (!req.isAuthenticated()) {
		return res.status(401).json({ error: "Not authenticated" });
	}

	res.json({
		user: {
			id: req.user.id,
			email: req.user.email,
			name: req.user.name,
			picture: req.user.picture,
		},
	});
});

// Your existing routes
router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
		accessType: "offline",
		prompt: "consent",
	})
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/login",
		failureMessage: true,
	}),
	(req, res) => {
		console.log("Google callback - User:", req.user);
		console.log("Google callback - Session:", req.session);

		// Ensure user is stored in session
		req.session.user = {
			id: req.user.id,
			email: req.user.email,
			name: req.user.name,
		};

		res.redirect(process.env.CLIENT_URL || "http://localhost:3000");
	}
);

router.post("/logout", (req, res) => {
	req.logout((err) => {
		if (err) {
			return res.status(500).json({ error: "Error logging out" });
		}
		req.session.destroy((err) => {
			if (err) {
				return res.status(500).json({ error: "Error destroying session" });
			}
			res.clearCookie("sessionId");
			res.json({ message: "Logged out successfully" });
		});
	});
});

export default router;
