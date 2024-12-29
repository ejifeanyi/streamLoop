"use client";

import React from "react";
import Image from "next/image";
import { ModeToggle } from "./ModeToggle";
import { useSession, signIn, signOut } from "next-auth/react";

const Header = () => {
	const { data: session } = useSession();
	console.log("session: ", session);
	console.log("image: ", session?.user?.picture);

	if (status === "loading") return null;

	return (
		<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 h-16 bg-card text-card-foreground border-b border-border shadow-sm">
			<div className="absolute left-1/2 transform -translate-x-1/2">
				<h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-indigo-500 to-secondary bg-clip-text text-transparent">
					Stream'n
				</h1>
			</div>

			<div className="flex items-center space-x-3 sm:space-x-4 ml-auto">
				{/* Conditionally Render Authentication Buttons */}
				{session ? (
					<>
						{/* Profile Picture */}
						<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted overflow-hidden">
							<Image
								src={
									session.user?.picture || "/path-to-default-profile-pic.jpg"
								}
								alt="Profile"
								width={40}
								height={40}
								className="object-cover"
							/>
						</div>
						<button
							onClick={() => signOut()}
							className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-primary transition"
						>
							Sign Out
						</button>
					</>
				) : (
					<button
						onClick={() => signIn("google")}
						className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition"
					>
						Sign In
					</button>
				)}
				<ModeToggle />
			</div>
		</header>
	);
};

export default Header;
