// src/services/auth.service.js
import { prisma } from "../utils/prisma.mjs";

export class AuthService {
	static async findUserByEmail(email) {
		return prisma.user.findUnique({
			where: { email },
			include: { connectedAccounts: true },
		});
	}

	static async createUser(userData) {
		return prisma.user.create({
			data: userData,
			include: { connectedAccounts: true },
		});
	}

	static async updateUser(id, userData) {
		return prisma.user.update({
			where: { id },
			data: userData,
			include: { connectedAccounts: true },
		});
	}
}
