'use client'

import React from "react";
import ConnectedAccountItem from "@/components/ConnectedAccountItem";
import AddNewAccountDropdown from "@/components/AddNewAccountDropdown";
import { Loader2 } from "lucide-react";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";

const services = ["Facebook", "YouTube", "TikTok", "Instagram", "Twitch"];

const AccountsPage = () => {
	const {
		connectedAccounts,
		loading,
		connectPlatform,
		togglePlatform,
		disconnectPlatform,
	} = usePlatformConnections();

	// Convert connected accounts to match existing component structure
	const accountItems = services.map((service) => {
		const matchedAccount = connectedAccounts.find(
			(account) => account.platform.toLowerCase() === service.toLowerCase()
		);

		return {
			name: service,
			isActive: matchedAccount?.isActive || false,
			connected: !!matchedAccount,
		};
	});

	const toggleAccount = (name: string) => {
		const account = connectedAccounts.find(
			(acc) => acc.platform.toLowerCase() === name.toLowerCase()
		);

		if (account) {
			togglePlatform(account.id);
		}
	};

	const addNewAccount = (name: string) => {
		// Initiate platform connection
		connectPlatform(name);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2
					className="animate-spin"
					size={32}
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-8">
			{/* Header */}
			<header className="mb-8">
				<h1 className="text-2xl sm:text-3xl font-bold text-foreground">
					Accounts
				</h1>
				<p className="text-muted-foreground mt-2 text-sm sm:text-base">
					Manage your connected accounts. Toggle to enable or disable accounts
					for streaming.
				</p>
			</header>

			{/* Connected Accounts List */}
			<div className="bg-card rounded-xl p-6">
				<h2 className="text-lg font-semibold text-foreground mb-4">
					Connected Accounts
				</h2>
				<ul className="space-y-4">
					{accountItems.map((account) => (
						<ConnectedAccountItem
							key={account.name}
							name={account.name}
							isActive={account.isActive}
							connected={account.connected}
							onToggle={() => toggleAccount(account.name)}
						/>
					))}
				</ul>
			</div>

			{/* Add New Account */}
			<div className="mt-8 flex justify-center">
				<AddNewAccountDropdown
					services={services}
					connectedAccounts={accountItems
						.filter((acc) => acc.connected)
						.map((acc) => acc.name)}
					onAdd={addNewAccount}
				/>
			</div>
		</div>
	);
};

export default AccountsPage;
