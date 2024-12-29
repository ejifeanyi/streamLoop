"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddNewAccountDropdownProps {
	services: string[];
	connectedAccounts: string[];
	onAdd: (name: string) => void;
}

const AddNewAccountDropdown: React.FC<AddNewAccountDropdownProps> = ({
	services,
	connectedAccounts,
	onAdd,
}) => {
	const availableServices = services.filter(
		(service) =>
			!connectedAccounts.some(
				(connectedAccount) =>
					connectedAccount.toLowerCase() === service.toLowerCase()
			)
	);

	const handleServiceClick = (service: string) => {
		if (service.toLowerCase() === "youtube") {
			// Redirect to the backend OAuth route for YouTube
			window.location.href = "http://localhost:5000/auth/youtube";
		} else {
			// Handle other services normally
			onAdd(service);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="flex items-center gap-2"
				>
					Add New Account
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="center"
				className="w-56"
			>
				{availableServices.length ? (
					availableServices.map((service) => (
						<DropdownMenuItem
							key={service}
							onClick={() => handleServiceClick(service)}
							className="cursor-pointer hover:bg-muted"
						>
							{service}
						</DropdownMenuItem>
					))
				) : (
					<span className="block text-sm text-muted-foreground px-3 py-2">
						All services are connected
					</span>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default AddNewAccountDropdown;
