// src/utils/prisma.js
import { PrismaClient } from "@prisma/client";

const prismaOptions = {
	log: ["error", "warn"],
	errorFormat: "pretty",
	__internal: {
		engine: {
			connectionTimeout: 20000, // 20s connection timeout
			pollInterval: 100,
		},
	},
};

let prisma;

if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient(prismaOptions);
} else {
	if (!global.prisma) {
		global.prisma = new PrismaClient(prismaOptions);
	}
	prisma = global.prisma;
}

// Add disconnect handler
process.on("beforeExit", async () => {
	await prisma.$disconnect();
});

export { prisma };
