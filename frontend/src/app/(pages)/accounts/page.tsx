// pages/accounts.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ConnectedAccountItem from "@/components/ConnectedAccountItem";
import AddNewAccountDropdown from "@/components/AddNewAccountDropdown";

const BACKEND_URL = "http://localhost:5000";

interface Account {
	id: string;
	platform: string;
	isActive: boolean;
	accountId: string;
}

const AccountsPage: React.FC = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(false);

	const availableServices = [
		"YouTube",
		"Facebook",
		"Twitter",
		"Instagram",
		"TikTok",
	];

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/");
			return;
		}

		const fetchAccounts = async () => {
			setLoading(true);
			try {
				const response = await fetch(`${BACKEND_URL}/api/accounts`, {
					headers: {
						Authorization: `Bearer ${session?.user?.token}`, // Replace `token` with the appropriate session property if needed
					},
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error("Failed to fetch accounts");
				}

				const data: Account[] = await response.json();
				setAccounts(data);
			} catch (error) {
				console.error("Error fetching accounts:", error);
			} finally {
				setLoading(false);
			}
		};

		if (status === "authenticated") {
			fetchAccounts();
		}
	}, [status, session, router]);

	if (status === "loading" || loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto">
			<h1 className="text-xl font-bold my-4">Manage Your Accounts</h1>
			<AddNewAccountDropdown
				services={availableServices}
				connectedAccounts={accounts.map((acc) => acc.platform)}
				onAdd={() => console.log("Add new account")} // Replace with actual function
			/>
			<ul className="space-y-4 mt-4">
				{accounts.map((account) => (
					<ConnectedAccountItem
						key={account.id}
						id={account.id}
						name={account.platform}
						isActive={account.isActive}
						connected
						onToggle={() => console.log("Toggle account")} // Replace with actual function
						onDisconnect={() => console.log("Disconnect account")} // Replace with actual function
					/>
				))}
			</ul>
		</div>
	);
};

export default AccountsPage;
