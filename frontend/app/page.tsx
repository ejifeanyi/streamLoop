"use client";

import AuthButton from "@/components/AuthButton";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
	const router = useRouter()

	useEffect(() => {
		const checkAuth = async () => {
			try {
				console.log("Starting authentication check...");
				const response = await fetch(`http://localhost:5000/auth/check`, {
					method: "GET",
					credentials: "include",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				});

				console.log("Response received:", response);

				// Check if response is JSON
				const contentType = response.headers.get("content-type");
				if (!contentType || !contentType.includes("application/json")) {
					throw new TypeError("Oops, we haven't got JSON!");
				}

				const data = await response.json();
				console.log("Response data:", data);

				if (data.authenticated) {
					setSession({ user: data.user });
					console.log("User Authenticated", data.user);
				} else {
					setSession(null);
					console.log("User not authenticated");
				}
			} catch (error) {
				console.error("Detailed Auth Check Error:", error);
				setSession(null);
			} finally {
				setLoading(false);
				console.log("Authentication check completed");
			}
		};

		checkAuth();
	}, []);

	if (loading) {
		return <Loader />;
	}

	if (session?.user) {
		router.push("/stream");
	}

	return (
		<div className="">
			<p>This is a Landing Page</p>

			<AuthButton session={session} />
		</div>
	);
}
