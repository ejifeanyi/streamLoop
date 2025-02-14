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

const AuthButton = ({
	session,
	variant = "default",
	className = "",
}: SignInButtonProps) => {
	const { signIn, signOut } = useAuth();

	if (variant === "minimal") {
		return session?.user ? (
			<Button onClick={signOut} variant="secondary">
				Sign Out
			</Button>
		) : (
			<Button onClick={signIn}>Sign In</Button>
		);
	}
	return session?.user ? (
		<div>
			<Button onClick={signOut} variant="secondary">
				Sign Out
			</Button>
		</div>
	) : (
		<Button onClick={signIn}>Sign In</Button>
	);
};

export default AuthButton;
