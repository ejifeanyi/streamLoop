"use client";

import React, { useState } from "react";
import { Home, User, RadioTower, Settings, LogOut, Menu } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
	const [selected, setSelected] = useState("dashboard");
	const [isOpen, setIsOpen] = useState(false);

	const menuItems = [
		{ id: "dashboard", name: "Dashboard", icon: <Home />, url: "/dashboard" },
		{ id: "accounts", name: "Accounts", icon: <User />, url: "/accounts" },
		{ id: "go-live", name: "Go Live", icon: <RadioTower />, url: "/go-live" },
		{ id: "settings", name: "Settings", icon: <Settings />, url: "/settings" },
		{ id: "logout", name: "Logout", icon: <LogOut />, url: "#" },
	];

	return (
		<div className="flex h-screen fixed z-50">
			{/* Mobile Menu Toggle */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-secondary text-secondary-foreground rounded-full shadow-md focus:outline-none"
			>
				<Menu className="h-6 w-6" />
			</button>

			{/* Sidebar */}
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
						>
							<button
								onClick={() => setSelected(item.id)}
								className={`flex items-center w-full mb-2 rounded-xl p-4 text-left text-sm font-medium transition-all duration-300 hover:bg-muted ${
									selected === item.id
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground"
								}`}
							>
								<div className="text-xl mr-2">{item.icon}</div>
								{item.name}
							</button>
						</Link>
					))}
				</div>
			</div>

			{/* Overlay for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/50 lg:hidden"
					onClick={() => setIsOpen(false)}
				></div>
			)}
		</div>
	);
};

export default Sidebar;
