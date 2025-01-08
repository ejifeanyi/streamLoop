"use client";

import { useState, useEffect } from "react";
import AccountList from "@/components/AccountList";
import ConnectDropdown from "@/components/ConnectDropdown";
import { ConnectedAccount } from "@/types/types";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";

const Page = () => {
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
			toast.error("Failed to load connected accounts");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Connected Accounts</h1>
				{/* Pass accounts and loadAccounts as props */}
				<ConnectDropdown
					accounts={accounts}
					onAccountUpdate={loadAccounts}
				/>
			</div>

			<div>
				<AccountList
					accounts={accounts}
					loading={loading}
					onToggle={setAccounts}
				/>
			</div>
		</div>
	);
};

export default Page;
