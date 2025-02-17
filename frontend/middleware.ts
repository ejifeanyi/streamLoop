// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const sessionCookie = req.cookies.get("sessionId");

	// If the session cookie is not present, redirect to the login page
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	// If the session cookie exists, allow the request to proceed
	return NextResponse.next();
}

// Configure the matcher to protect the /stream route
export const config = {
	matcher: ["/stream/:path*"],
};
