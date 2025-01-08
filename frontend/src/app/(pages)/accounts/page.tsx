"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ConnectedAccountItem from "@/components/ConnectedAccountItem";
import { Button } from "@/components/ui/button";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";
import { ConnectedAccount } from "@/types/types";

export default function AccountsPage() {
	const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const searchParams = useSearchParams();

	useEffect(() => {
		loadAccounts();
		checkAuthStatus();
	}, []);

	const checkAuthStatus = () => {
		const youtube = searchParams.get("youtube");
		const error = searchParams.get("error");

		if (youtube === "connected") {
			toast.success("YouTube account connected successfully!");
		} else if (error) {
			toast.error(`Connection failed: ${error.replace(/_/g, " ")}`);
		}
	};

	const loadAccounts = async () => {
		try {
			const accounts = await platformService.getConnectedAccounts();
			console.log("AccountsPage received accounts:", accounts);
			console.log("Account count:", accounts.length);
			console.log("First account details:", accounts[0]);
			setAccounts(accounts);
		} catch (error) {
			console.log("Error in loadAccounts:", error);
			toast.error("Failed to load connected accounts");
		} finally {
			setLoading(false);
		}
	};

	const handleConnectYoutube = () => {
		platformService.initiateConnection("youtube");
	};

	const handleConnectTwitch = () => {
		platformService.initiateConnection("twitch");
	};

	const handleToggle = async (accountId: string, currentState: boolean) => {
		try {
			await platformService.togglePlatform(accountId, !currentState);
			setAccounts(
				accounts.map((account) =>
					account.id === accountId
						? { ...account, isActive: !currentState }
						: account
				)
			);
			toast.success("Account status updated");
		} catch (error) {
			toast.error("Failed to update account status");
		}
	};

	const handleDisconnect = async (platform: string) => {
		try {
			await platformService.disconnectPlatform(platform);
			setAccounts(accounts.filter((account) => account.platform !== platform));
			toast.success("Account disconnected successfully");
		} catch (error) {
			toast.error("Failed to disconnect account");
		}
	};

	return (
		<div className="container mx-auto py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Connected Accounts</h1>
				{!accounts.some(
					(account) => account.platform.toLowerCase() === "youtube"
				) && <Button onClick={handleConnectYoutube}>Connect YouTube</Button>}
				{!accounts.some(
					(account) => account.platform.toLowerCase() === "twitch"
				) && (
					<Button
						onClick={handleConnectTwitch}
						className="bg-purple-600 hover:bg-purple-700"
					>
						Connect Twitch
					</Button>
				)}
			</div>

			{loading ? (
				<div className="flex justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				</div>
			) : (
				<div className="space-y-4">
					{accounts.map((account) => (
						<ConnectedAccountItem
							key={account.id} // Also added a key prop which is required for lists
							account={account} // Changed from accountData to account
							onToggle={(accountId, isActive) =>
								handleToggle(accountId, isActive)
							}
							onDisconnect={(platform) => handleDisconnect(platform)}
						/>
					))}
					{accounts.length === 0 && (
						<p className="text-center text-gray-500">
							No accounts connected. Connect your first account to get started.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
