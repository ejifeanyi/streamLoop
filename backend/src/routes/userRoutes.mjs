import express from "express";
import { isAuthenticated } from "../middlewares/auth.mjs";
import {
	connectAccount,
	disconnectAccount,
	toggleAccountStatus,
	getConnectedAccounts,
} from "../controllers/accountController.mjs";

const router = express.Router();

router.get("/profile", isAuthenticated, (req, res) => {
	res.json(req.user);
});

router.post("/connect", isAuthenticated, connectAccount);
router.delete("/disconnect/:accountId", isAuthenticated, disconnectAccount);
router.patch("/toggle/:accountId", isAuthenticated, toggleAccountStatus);
router.get("/accounts", isAuthenticated, getConnectedAccounts);

export default router;
