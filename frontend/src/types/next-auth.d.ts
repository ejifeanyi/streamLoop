import NextAuth from "next-auth";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
		user?: {
			name?: string | null;
			email?: string | null;
			image?: string | null;
			[key: string]: any; // To allow additional properties
		};
	}

	interface JWT {
		accessToken?: string;
		refreshToken?: string;
		user?: {
			name?: string | null;
			email?: string | null;
			image?: string | null;
			[key: string]: any; // To allow additional properties
		};
	}
}
