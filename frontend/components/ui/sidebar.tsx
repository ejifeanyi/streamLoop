"use client";

import { Home, Menu, RadioTower, Settings, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";
import Link from "next/link";

const sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	const menuItems = [
		{ id: "dashboard", name: "Dashboard", icon: <Home />, url: "/dashboard" },
		{ id: "accounts", name: "Accounts", icon: <User />, url: "/accounts" },
		{ id: "go-live", name: "Go Live", icon: <RadioTower />, url: "/go-live" },
		{
			id: "settings",
			name: "Settings",
			icon: <Settings />,
			url: "/settings",
		},
	];

	return (
		<div className="flex h-screen fixed z-50">
			<Button
				onClick={() => setIsOpen(!isOpen)}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-secondary text-secondary-foreground rounded-full shadow-md focus:outline-none"
			>
				<Menu className="h-6 w-6" />
			</Button>

			<div
				className={`fixed z-40 lg:relative flex flex-col h-full bg-card text-card-foreground transition-transform duration-300 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} lg:translate-x-0 border-r border-border lg:w-[250px] w-[200px]`}
			>
				<div className="mt-[150px] mx-3 flex-grow">
					{menuItems.map((item) => (
						<Link
							key={item.id}
							href={item.url}
							className={`flex items-center space-x-3 p-3 rounded-lg w-full font-medium transition-all duration-300 hover:bg-muted ${
								pathname === item.url
									? "bg-primary text-primary-foreground"
									: ""
							}`}
						>
							{item.icon}
							<span className="ml-2">{item.name}</span>
						</Link>
					))}
				</div>
			</div>

			{isOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/50 lg:hidden"
					onClick={() => setIsOpen(false)}
				></div>
			)}
		</div>
	);
};

export default sidebar;
