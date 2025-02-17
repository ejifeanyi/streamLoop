"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Container } from "./Container";
import classNames from "classnames";
import { useTheme } from "next-themes";
import ConnectAccountModal from "./ConnectAccountModal";
import { useAuth } from "@/app/AuthContext";

export const Navbar = () => {
	const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const { signIn, signOut, user } = useAuth();

	// Ensure component is mounted to avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const html = document.querySelector("html");
		if (html) html.classList.toggle("overflow-hidden", hamburgerMenuIsOpen);
	}, [hamburgerMenuIsOpen]);

	useEffect(() => {
		const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false);

		window.addEventListener("orientationchange", closeHamburgerNavigation);
		window.addEventListener("resize", closeHamburgerNavigation);

		return () => {
			window.removeEventListener("orientationchange", closeHamburgerNavigation);
			window.removeEventListener("resize", closeHamburgerNavigation);
		};
	}, [setHamburgerMenuIsOpen]);

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<header className="fixed top-0 left-0 z-10 w-full border-b border-transparent-white backdrop-blur-[12px]">
			<Container className="flex py-2 items-center">
				<Link className="flex items-center text-md" href="/">
					{/* <Logo className="mr-4 h-[1.8rem] w-[1.8rem]" /> */}
					StreamLoop
				</Link>

				<div
					className={classNames(
						"transition-[visibility] md:visible",
						hamburgerMenuIsOpen ? "visible" : "delay-500 invisible"
					)}
				>
					<nav
						className={classNames(
							"fixed top-navigation-height left-0 h-[calc(100vh_-_var(--navigation-height))] w-full overflow-auto bg-background transition-opacity duration-500 md:relative md:top-0 md:block md:h-auto md:w-auto md:translate-x-0 md:overflow-hidden md:bg-transparent md:opacity-100 md:transition-none",
							hamburgerMenuIsOpen
								? "translate-x-0 opacity-100"
								: "translate-x-[-100vw] opacity-0"
						)}
					></nav>
				</div>

				<div className="ml-auto gap-2 flex h-full items-center">
					{user && <ConnectAccountModal />}
					<Button
						variant="outline"
						size="icon"
						onClick={toggleTheme}
						aria-label="Toggle theme"
					>
						{mounted &&
							(theme === "dark" ? (
								<Moon className="h-5 w-5" />
							) : (
								<Sun className="h-5 w-5" />
							))}
					</Button>
					{user ? (
						<Button onClick={signOut}>Sign out</Button>
					) : (
						<Button onClick={signIn}>Sign in</Button>
					)}
				</div>

				<button
					className="ml-6 md:hidden"
					onClick={() => setHamburgerMenuIsOpen((open) => !open)}
				>
					<span className="sr-only">Toggle menu</span>
					<Menu />
				</button>
			</Container>
		</header>
	);
};
