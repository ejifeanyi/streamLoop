import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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

const ConnectAccountModal = () => {
	const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);

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

	if (open) {
		loadAccounts();
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost">Connect Account</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Connect Accounts</DialogTitle>
					<DialogDescription>
						Connect and manage your streaming platform accounts
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<div className="flex justify-between items-center mb-4">
						<ConnectDropdown
							accounts={accounts}
							onAccountUpdate={() => {
								loadAccounts();
							}}
						/>
					</div>

					<AccountList
						accounts={accounts}
						loading={loading}
						onToggle={setAccounts}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ConnectAccountModal;
