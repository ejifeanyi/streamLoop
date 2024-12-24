"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

interface PlatformAccount {
	id: string;
	platform: string;
	platformUsername?: string;
	isActive: boolean;
}

export function usePlatformConnections() {
	const [connectedAccounts, setConnectedAccounts] = useState<PlatformAccount[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch connected platforms
	const fetchPlatforms = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch("/api/platforms", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch platforms");
			}

			const platforms = await response.json();
			setConnectedAccounts(platforms);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Connect a new platform
	const connectPlatform = async (platform: string) => {
		try {
			setLoading(true);
			setError(null);

			if (platform.toLowerCase() === "youtube") {
				// Use NextAuth's signIn method for YouTube
				await signIn("google", {
					callbackUrl: `/api/auth/youtube/connect`,
				});
			} else {
				// Handle other platforms as before
				window.location.href = `/api/auth/${platform.toLowerCase()}/redirect`;
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to initiate platform connection";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Disconnect a platform
	const disconnectPlatform = async (platformId: string) => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch(`/api/platforms/${platformId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to disconnect platform");
			}

			// Remove the disconnected platform from the list
			setConnectedAccounts((prev) =>
				prev.filter((account) => account.id !== platformId)
			);

			toast.success("Platform disconnected successfully");
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to disconnect platform";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Toggle platform active status
	const togglePlatform = async (platformId: string) => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch(`/api/platforms/${platformId}/toggle`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to toggle platform status");
			}

			// Update the platform's active status
			const updatedPlatform = await response.json();
			setConnectedAccounts((prev) =>
				prev.map((account) =>
					account.id === platformId
						? { ...account, isActive: updatedPlatform.isActive }
						: account
				)
			);

			toast.success("Platform status updated");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to toggle platform";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Fetch platforms on component mount
	useEffect(() => {
		fetchPlatforms();
	}, []);

	return {
		connectedAccounts,
		loading,
		error,
		connectPlatform,
		disconnectPlatform,
		togglePlatform,
		refetch: fetchPlatforms,
	};
}
