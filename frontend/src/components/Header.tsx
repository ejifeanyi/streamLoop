"use client";

import React from "react";
import { ModeToggle } from "./ModeToggle";
import AuthButton from "./AuthButton";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
	const { user, loading } = useAuth();

	if (loading) {
		return <div>Loading...</div>;
	}

	// Create a session object to match your AuthButton's expected props
	const session = user ? { user } : null;

	return (
		<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 h-16 bg-card text-card-foreground border-b border-border shadow-sm">
			<div className="absolute left-1/2 transform -translate-x-1/2">
				<h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-indigo-500 to-secondary bg-clip-text text-transparent">
					StreamLoop
				</h1>
			</div>
			<div className="flex items-center space-x-3 sm:space-x-4 ml-auto">
				<AuthButton session={session} />
				<ModeToggle />
			</div>
		</header>
	);
};

export default Header;
