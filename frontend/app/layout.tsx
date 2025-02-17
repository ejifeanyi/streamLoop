import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Providers from "./Providers";
import { cn } from "@/lib/utils";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
	title: "StreamLoop",
	description: "Your no.1 source for all things streaming",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="scrollbar" suppressHydrationWarning>
			<body
				className={cn(
					"min-h-screen bg-background text-foreground antialiased !font-default overflow-x-hidden",
					poppins.className
				)}
				suppressHydrationWarning
			>
				<Providers>
					<Toaster richColors theme="dark" position="top-right" />
					{children}
				</Providers>
			</body>
		</html>
	);
}
