import React from "react";
import AuthMiddleware from "../AuthMiddleware";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<AuthMiddleware>
			<div className="flex h-screen bg-background text-foreground">
				<main className="flex-grow overflow-y-auto p-4">
					{children}
				</main>
			</div>
		</AuthMiddleware>
	);
};

export default DashboardLayout;
