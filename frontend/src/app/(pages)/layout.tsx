'use client'

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div>
			<Header />
			<div className="flex h-screen bg-background text-foreground">
				<Sidebar />

				<main className="flex-grow overflow-y-auto lg:ml-[250px] px-4 sm:px-6 md:px-8 lg:px-12 pt-16">
					{children}
				</main>
			</div>
		</div>
	);
};

export default layout;
