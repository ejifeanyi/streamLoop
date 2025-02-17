import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


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

interface ConnectedAccountItemProps {
	account: ConnectedAccount;
	onToggle: (accountId: string, isActive: boolean) => void;
	onDisconnect: (platform: string) => void;
}

const ConnectedAccountItem: React.FC<ConnectedAccountItemProps> = ({
	account,
	onToggle,
	onDisconnect,
}) => {
	const displayName = account.channelData?.channelTitle || account.platform;

	return (
		<Card className="p-4 mb-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Avatar>
						<AvatarFallback className="bg-primary/10">
							{displayName[0]}
						</AvatarFallback>
					</Avatar>
					<div>
						<h3 className="font-medium">{displayName}</h3>
						{account.channelData && (
							<p className="text-sm text-muted-foreground">
								{Number(account.channelData.subscribers).toLocaleString()}{" "}
								subscribers •{" "}
								{Number(account.channelData.videos).toLocaleString()} videos
							</p>
						)}
					</div>
				</div>
				<div className="flex items-center gap-4">
					<Switch
						checked={account.isActive}
						onCheckedChange={() => onToggle(account.id, account.isActive)}
						className={account.isActive ? "bg-primary" : "bg-muted"}
					/>
					<Button
						variant="destructive"
						onClick={() => onDisconnect(account.platform)}
						size="sm"
					>
						Disconnect
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default ConnectedAccountItem;