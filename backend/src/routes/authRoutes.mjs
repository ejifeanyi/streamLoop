import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
	"/google/callback",
	passport.authenticate("google", { failureRedirect: "/" }),
	(req, res) => {
		res.redirect("/profile");
	}
);

router.get("/tiktok", (req, res) => {
	const clientKey = process.env.TIKTOK_CLIENT_KEY;
	const redirectUri = encodeURIComponent(
		"http://localhost:5000/auth/tiktok/callback"
	);
	const url = `https://open-api.tiktok.com/platform/oauth/connect/?client_key=${clientKey}&response_type=code&redirect_uri=${redirectUri}&scope=user.info.basic`;
	res.redirect(url);
});

router.get(
	"/tiktok/callback",
	passport.authenticate("tiktok", { failureRedirect: "/" }),
	(req, res) => {
		res.redirect("/profile");
	}
);

router.get("/logout", (req, res) => {
	req.logout(() => {
		res.redirect("/");
	});
});

export default router;
