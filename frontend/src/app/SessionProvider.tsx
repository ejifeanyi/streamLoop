"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionProviderComponent({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<body>
			<SessionProvider>{children}</SessionProvider>
		</body>
	);
}
