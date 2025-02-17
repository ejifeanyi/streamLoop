import { platformService } from "@/services/platformService";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";
import ConnectedAccountItem from "./ConnectedAccountItem";
import { toast } from "sonner";

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

interface AccountListProps {
	accounts: ConnectedAccount[];
	loading: boolean;
	onToggle: (updatedAccounts: ConnectedAccount[]) => void;
}

const AccountList: React.FC<AccountListProps> = ({
	accounts,
	loading,
	onToggle,
}) => {
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
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(`Failed to update account status: ${error.message}`);
			} else {
				toast.error("Failed to update account status");
			}
		}
	};

	const handleDisconnect = async (platform: string) => {
		try {
			await platformService.disconnectPlatform(platform);
			onToggle(accounts.filter((account) => account.platform !== platform));
			toast.success("Account disconnected successfully");
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(`Failed to disconnect account: ${error.message}`);
			} else {
				toast.error("Failed to disconnect account");
			}
		}
	};

	if (loading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<Card className="p-4" key={i}>
						<div className="flex items-center gap-4">
							<Skeleton className="h-12 w-12 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-48" />
								<Skeleton className="h-4 w-32" />
							</div>
						</div>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{accounts.map((account) => (
				<ConnectedAccountItem
					key={account.id}
					account={account}
					onToggle={handleToggle}
					onDisconnect={handleDisconnect}
				/>
			))}
			{accounts.length === 0 && (
				<Card className="p-8 text-center text-muted-foreground">
					No accounts connected. Connect your first account to get started.
				</Card>
			)}
		</div>
	);
};

export default AccountList;
