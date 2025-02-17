// src/utils/prisma.js
import { PrismaClient } from "@prisma/client";

const prismaOptions = {
	log: ["error", "warn"],
	errorFormat: "pretty",
	datasources: {
		db: {
			url: process.env.DATABASE_URL,
		},
	},
	__internal: {
		engine: {
			connectionTimeout: 30000,
			pollInterval: 500,
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
