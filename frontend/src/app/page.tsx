"use client";

import React, { useState, useEffect } from "react";
import AuthButton from "@/components/AuthButton";

interface User {
	id: string;
	email: string;
	name: string;
	picture?: string;
}

interface Session {
	user: User | null;
}

export default function Home() {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("http://localhost:5000/auth/check", {
					credentials: "include",
				});
				const data = await response.json();
				if (data.authenticated) {
					setSession({ user: data.user });
				} else {
					setSession(null);
				}
			} catch (error) {
				console.error("Auth check failed:", error);
				setSession(null);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}
	return (
		<div>
			Landing page
			<AuthButton session={session} />
		</div>
	);
}
