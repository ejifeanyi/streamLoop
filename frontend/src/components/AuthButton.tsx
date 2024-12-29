// src/components/SignInButton.tsx
"use client";

import React from "react";
import Image from "next/image";

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
	const handleSignIn = () => {
		window.location.href = "http://localhost:5000/auth/google";
	};

	const handleSignOut = async () => {
		try {
			const response = await fetch("http://localhost:5000/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			if (response.ok) {
				window.location.reload();
			}
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	if (variant === "minimal") {
		return session?.user ? (
			<button
				onClick={handleSignOut}
				className={`text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 ${className}`}
			>
				Sign Out
			</button>
		) : (
			<button
				onClick={handleSignIn}
				className={`text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 ${className}`}
			>
				Sign In
			</button>
		);
	}

	return session?.user ? (
		<div className={`flex items-center space-x-3 ${className}`}>
			<div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
				<Image
					src={session.user.picture || "/path-to-default-profile-pic.jpg"}
					alt="Profile"
					width={32}
					height={32}
					className="object-cover"
				/>
			</div>
			<button
				onClick={handleSignOut}
				className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-primary transition"
			>
				Sign Out
			</button>
		</div>
	) : (
		<button
			onClick={handleSignIn}
			className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition"
		>
			Sign In
		</button>
	);
};

export default AuthButton;
