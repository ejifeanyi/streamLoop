import express from "express";
import { isAuthenticated } from "../middlewares/auth.mjs";
import {
	connectAccount,
	disconnectAccount,
	toggleAccountStatus,
	getConnectedAccounts,
} from "../controllers/accountController.mjs";

const router = express.Router();

// User profile
router.get("/profile", isAuthenticated, (req, res) => {
	res.json(req.user);
});

// Account management
router.get("/accounts", isAuthenticated, getConnectedAccounts);
router.post("/accounts/connect", isAuthenticated, connectAccount);
router.put("/accounts/:id/toggle", isAuthenticated, toggleAccountStatus);
router.delete("/accounts/:id/disconnect", isAuthenticated, disconnectAccount);

export default router;
