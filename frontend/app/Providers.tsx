"use client";

import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<AuthProvider>{children}</AuthProvider>
		</ThemeProvider>
	);
}
