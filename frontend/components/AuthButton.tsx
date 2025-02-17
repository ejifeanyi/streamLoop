"use client";

import { useAuth } from "@/app/AuthContext";
import { Button } from "./ui/button";

interface User {
	id: string;
	email: string;
	name: string;
	picture?: string;
}

interface Session {
	user: User | null;
}

interface SignInButtonProps {
	session: Session | null;
	variant?: "default" | "minimal";
	className?: string;
}

const AuthButton = ({ session }: SignInButtonProps) => {
	const { signIn, signOut } = useAuth();

	return session?.user ? (
		<div>
			<Button onClick={signOut}>Sign Out</Button>
		</div>
	) : (
		<Button onClick={signIn}>Sign In</Button>
	);
};

export default AuthButton;
