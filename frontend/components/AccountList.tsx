"use client";

import React from "react";
import { toast } from "sonner";
import { platformService } from "@/services/platformService";
import ConnectedAccountItem from "./ConnectedAccountItem";
import Loader from "./Loader";

interface AccountListProps {
	accounts: ConnectedAccount[];
	loading: boolean;
	onToggle: (updatedAccounts: ConnectedAccount[]) => void;
}

interface ConnectedAccount {
	id: string;
	platform: string;
	accountId: string;
	isActive: boolean;
	createdAt: string;
	channelData?: {
		channelTitle: string;
		subscribers: number;
		videos: number;
	};
}

const AccountList = ({ accounts, loading, onToggle }: AccountListProps) => {
	const handleToggle = async (accountId: string, currentState: boolean) => {
		try {
			await platformService.togglePlatform(accountId, !currentState);
			onToggle(
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
			onToggle(accounts.filter((account) => account.platform !== platform));
			toast.success("Account disconnected successfully");
		} catch (error) {
			toast.error("Failed to disconnect account");
		}
	};

	return (
		<div>
			{loading ? (
				<Loader />
			) : (
				<div className="space-y-4">
					{accounts.map((account) => (
						<ConnectedAccountItem
							key={account.id}
							account={account}
							onToggle={(accountId, isActive) =>
								handleToggle(accountId, isActive)
							}
							onDisconnect={(platform) => handleDisconnect(platform)}
						/>
					))}
					{accounts.length === 0 && (
						<p className="mt-20 text-gray-600">
							No accounts connected. Connect your first account to get started.
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default AccountList;
