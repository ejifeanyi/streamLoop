import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
	log: ["query", "info", "warn", "error"],
});

async function testConnection() {
	try {
		console.log("Testing database connection...");
		const result = await prisma.$connect();
		console.log("Database connection successful!");
		return true;
	} catch (error) {
		console.error("Database connection failed:", error);
		return false;
	} finally {
		await prisma.$disconnect();
	}
}

testConnection();
