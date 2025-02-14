"use client";

import React, { useEffect, useState } from "react";
import { platformService } from "@/services/platformService";
import ConnectDropdown from "@/components/ConnectDropdown";
import AccountList from "@/components/AccountList";

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

const page = () => {
	const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadAccounts();
	}, []);

	const loadAccounts = async () => {
		try {
			const accounts = await platformService.getConnectedAccounts();
			setAccounts(accounts);
		} catch (error) {
			console.log("Failed to load connected accounts:", error);
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className="container mx-auto py-8">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-2xl font-semibold">My Accounts</h3>
				<ConnectDropdown accounts={accounts} onAccountUpdate={loadAccounts} />
			</div>

			<AccountList
				accounts={accounts}
				loading={loading}
				onToggle={setAccounts}
			/>
		</div>
	);
};

export default page;
