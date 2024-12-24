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
		(service) => !connectedAccounts.includes(service)
	);

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
							onClick={() => onAdd(service)}
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
