"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface ConnectedAccountItemProps {
	name: string;
	isActive: boolean;
	connected: boolean;
	onToggle: () => void;
}

const ConnectedAccountItem: React.FC<ConnectedAccountItemProps> = ({
	name,
	isActive,
	connected,
	onToggle,
}) => {
	return (
		<li className="flex items-center justify-between bg-card p-4 rounded-lg hover:shadow-md transition">
			<div className="flex items-center gap-4">
				<div className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-lg font-bold uppercase">
					{name[0]}
				</div>
				<div>
					<span className="text-sm font-medium text-foreground">{name}</span>
					{!connected && (
						<span className="text-xs text-muted-foreground ml-2">
							Not Connected
						</span>
					)}
				</div>
			</div>
			{connected ? (
				<Switch
					checked={isActive}
					onCheckedChange={onToggle}
					className={isActive ? "bg-success" : "bg-muted"}
				/>
			) : (
				<Button
					size="sm"
					variant="outline"
				>
					Connect
				</Button>
			)}
		</li>
	);
};

export default ConnectedAccountItem;
