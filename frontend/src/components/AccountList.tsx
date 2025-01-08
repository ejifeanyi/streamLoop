"use client";

import React from "react";
import { ConnectedAccount } from "@/types/types";
import { toast } from "sonner";
import ConnectedAccountItem from "./ConnectedAccountItem";
import { platformService } from "@/services/platformService";

interface AccountListProps {
	accounts: ConnectedAccount[];
	loading: boolean;
	onToggle: (updatedAccounts: ConnectedAccount[]) => void;
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
				<div className="flex justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				</div>
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
