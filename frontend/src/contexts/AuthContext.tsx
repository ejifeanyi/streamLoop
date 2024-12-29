"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
	id: string;
	email: string;
	name: string;
	picture?: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	checkAuth: () => Promise<void>;
	signIn: () => void;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const checkAuth = async () => {
		try {
			const response = await fetch("http://localhost:3000/auth/me", {
				credentials: "include",
			});
			if (response.ok) {
				const data = await response.json();
				setUser(data.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.log("Auth check failed:", error);
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const signIn = () => {
		window.location.href = "http://localhost:3000/auth/google";
	};

	const signOut = async () => {
		try {
			await fetch("http://localhost:3000/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			setUser(null);
		} catch (error) {
			console.log("Logout failed:", error);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, checkAuth, signIn, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
