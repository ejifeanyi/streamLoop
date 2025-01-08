// ConnectDropdown.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";

interface ConnectDropdownProps {
	accounts: { platform: string }[];
	onAccountUpdate: () => void; // Callback to reload accounts in parent
}

const ConnectDropdown = ({
	accounts,
	onAccountUpdate,
}: ConnectDropdownProps) => {
	const handleConnectYoutube = async () => {
		try {
			await platformService.initiateConnection("youtube");
			toast.success("YouTube account connection initiated!");
			onAccountUpdate();
		} catch (error) {
			toast.error("Failed to initiate YouTube connection");
		}
	};

	const handleConnectTwitch = async () => {
		try {
			await platformService.initiateConnection("twitch");
			toast.success("Twitch account connection initiated!");
			onAccountUpdate();
		} catch (error) {
			toast.error("Failed to initiate Twitch connection");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary">Connect Account</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{!accounts.some(
					(account) => account.platform.toLowerCase() === "youtube"
				) && (
					<DropdownMenuItem onClick={handleConnectYoutube}>
						Connect YouTube
					</DropdownMenuItem>
				)}
				{!accounts.some(
					(account) => account.platform.toLowerCase() === "twitch"
				) && (
					<DropdownMenuItem onClick={handleConnectTwitch}>
						Connect Twitch
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default ConnectDropdown;