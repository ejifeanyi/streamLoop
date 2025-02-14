"use client";

import { useAuth } from "@/app/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface Props {
	children: React.ReactNode;
}

const AuthMiddleware = ({ children }: Props) => {
	const { user, loading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!loading && !user) {
			// Store the attempted URL
			sessionStorage.setItem("redirectTo", pathname);
			router.push("/");
		}
	}, [loading, user, router, pathname]);

	// Show nothing while loading
	if (loading) return null;

	// If not authenticated, the useEffect above will handle redirect
	if (!user) return null;

	// If authenticated, render children
	return <>{children}</>;
};

export default AuthMiddleware;
