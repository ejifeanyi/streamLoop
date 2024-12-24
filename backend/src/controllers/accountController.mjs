import { prisma } from "../utils/prisma.mjs";

export const connectAccount = async (req, res) => {
	const { platform, accountId, accessToken, refreshToken } = req.body;
	const userId = req.user.id;

	try {
		const account = await prisma.connectedAccount.create({
			data: {
				userId,
				platform,
				accountId,
				accessToken,
				refreshToken,
			},
		});
		res.json(account);
	} catch (error) {
		res.status(500).json({ error: "Failed to connect account." });
	}
};

export const disconnectAccount = async (req, res) => {
	const { accountId } = req.params;
	const userId = req.user.id;

	try {
		await prisma.connectedAccount.deleteMany({
			where: { id: accountId, userId },
		});
		res.json({ message: "Account disconnected successfully." });
	} catch (error) {
		res.status(500).json({ error: "Failed to disconnect account." });
	}
};

export const toggleAccountStatus = async (req, res) => {
	const { accountId } = req.params;
	const userId = req.user.id;

	try {
		const account = await prisma.connectedAccount.updateMany({
			where: { id: accountId, userId },
			data: { isActive: { not: true } },
		});
		res.json({ message: "Account status updated.", account });
	} catch (error) {
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
		res.status(500).json({ error: "Failed to fetch connected accounts." });
	}
};
