"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface ConnectedAccountItemProps {
	id: string;
	name: string;
	isActive: boolean;
	connected: boolean;
	onToggle: () => void;
	onDisconnect: () => void;
}

const ConnectedAccountItem: React.FC<ConnectedAccountItemProps> = ({
	id,
	name,
	isActive,
	connected,
	onToggle,
	onDisconnect,
}) => {
	return (
		<li className="flex items-center justify-between bg-card p-4 rounded-lg hover:shadow-md transition">
			<div className="flex items-center gap-4">
				<div className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-lg font-bold uppercase">
					{name[0]}
				</div>
				<div>
					<span className="text-sm font-medium text-foreground">{name}</span>
				</div>
			</div>
			<div className="flex items-center gap-4">
				{connected && (
					<Switch
						checked={isActive}
						onCheckedChange={onToggle}
						className={isActive ? "bg-success" : "bg-muted"}
					/>
				)}
				<Button
					size="sm"
					variant="destructive"
					onClick={onDisconnect}
				>
					Disconnect
				</Button>
			</div>
		</li>
	);
};

export default ConnectedAccountItem;
