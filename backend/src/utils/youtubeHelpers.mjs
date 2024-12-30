import { google } from "googleapis";
import { prisma } from "./prisma.mjs";

export async function refreshYouTubeToken(connectedAccount) {
	const oauth2Client = new google.auth.OAuth2(
		process.env.YOUTUBE_CLIENT_ID,
		process.env.YOUTUBE_CLIENT_SECRET
	);

	oauth2Client.setCredentials({
		refresh_token: connectedAccount.refreshToken,
	});

	try {
		const { tokens } = await oauth2Client.refreshAccessToken();
		await prisma.connectedAccount.update({
			where: { id: connectedAccount.id },
			data: {
				accessToken: tokens.access_token,
				tokenExpiry: new Date(tokens.expiry_date),
			},
		});
		return tokens.access_token;
	} catch (error) {
		console.error("Token refresh failed:", error);
		throw error;
	}
}
