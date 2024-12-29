import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import React from "react";
import ClientProviders from "./ClientProviders";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<ClientProviders>
			<div>
				<Header />
				<div className="flex h-screen bg-background text-foreground">
					<Sidebar />
					<main className="flex-grow overflow-y-auto lg:ml-[250px] px-4 sm:px-6 md:px-8 lg:px-12 pt-16">
						{children}
					</main>
				</div>
			</div>
		</ClientProviders>
	);
};

export default Layout;
