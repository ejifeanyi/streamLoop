import { prisma } from "../utils/prisma.mjs";

export const connectAccount = async (req, res) => {
	const { platform } = req.body;
	const userId = req.user.id;

	try {
		const account = await prisma.connectedAccount.create({
			data: {
				userId,
				platform,
				accountId: `manual-${Date.now()}`, // For non-OAuth connections
				accessToken: "manual-connection",
				isActive: true,
			},
		});
		res.json(account);
	} catch (error) {
		console.error("Error connecting account:", error);
		res.status(500).json({ error: "Failed to connect account." });
	}
};

export const disconnectAccount = async (req, res) => {
	const { id } = req.params;
	const userId = req.user.id;

	try {
		await prisma.connectedAccount.deleteMany({
			where: {
				id,
				userId,
			},
		});
		res.json({ message: "Account disconnected successfully." });
	} catch (error) {
		console.error("Error disconnecting account:", error);
		res.status(500).json({ error: "Failed to disconnect account." });
	}
};

export const toggleAccountStatus = async (req, res) => {
	const { id } = req.params;
	const userId = req.user.id;

	try {
		const account = await prisma.connectedAccount.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!account) {
			return res.status(404).json({ error: "Account not found." });
		}

		const updatedAccount = await prisma.connectedAccount.update({
			where: { id },
			data: { isActive: !account.isActive },
		});

		res.json(updatedAccount);
	} catch (error) {
		console.error("Error toggling account:", error);
		res.status(500).json({ error: "Failed to toggle account status." });
	}
};

export const getConnectedAccounts = async (req, res) => {
	const userId = req.user.id;

	try {
		const accounts = await prisma.connectedAccount.findMany({
			where: { userId },
		});
		res.json(accounts);
	} catch (error) {
		console.error("Error fetching accounts:", error);
		res.status(500).json({ error: "Failed to fetch connected accounts." });
	}
};
