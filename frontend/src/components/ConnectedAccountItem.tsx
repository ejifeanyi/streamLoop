"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface ConnectedAccount {
	id: string;
	platform: string;
	accountId: string;
	isActive: boolean;
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
		<li className="flex items-center justify-between bg-card p-4 rounded-lg hover:shadow-md transition">
			<div className="flex items-center gap-4">
				<div className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-lg font-bold uppercase">
					{displayName[0]}
				</div>
				<div>
					<span className="text-sm font-medium text-foreground">
						{displayName}
					</span>
					{account.channelData && (
						<div className="text-xs text-muted-foreground">
							{Number(account.channelData.subscribers).toLocaleString()}{" "}
							subscribers •{Number(account.channelData.videos).toLocaleString()}{" "}
							videos
						</div>
					)}
				</div>
			</div>
			<div className="flex items-center gap-4">
				<Switch
					checked={account.isActive}
					onCheckedChange={() => onToggle(account.id, account.isActive)}
					className={account.isActive ? "bg-success" : "bg-muted"}
				/>
				<Button
					size="sm"
					variant="destructive"
					onClick={() => onDisconnect(account.platform)}
				>
					Disconnect
				</Button>
			</div>
		</li>
	);
};

export default ConnectedAccountItem;
