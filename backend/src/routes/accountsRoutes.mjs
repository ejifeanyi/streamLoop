import { isAuthenticated } from "../middlewares/auth.mjs";
import { prisma } from "../utils/prisma.mjs";

router.get("/accounts", isAuthenticated, async (req, res) => {
	try {
		const accounts = await prisma.connectedAccount.findMany({
			where: {
				userId: req.user.id,
			},
		});

		console.log("Fetched accounts:", accounts); // Backend console log
		res.json(accounts);
	} catch (error) {
		console.error("Error fetching connected accounts:", error);
		res.status(500).json({ error: "Failed to fetch connected accounts" });
	}
});
