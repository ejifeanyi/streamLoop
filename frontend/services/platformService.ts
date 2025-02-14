export const platformService = {
	async getConnectedAccounts() {
		// Update this URL to match your backend route
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/platform/accounts`,
			{
				credentials: "include",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch connected accounts");
		}

		const data = await response.json();
		console.log("Frontend received accounts:", data);
		return data;
	},

	async togglePlatform(accountId: string, isActive: boolean): Promise<void> {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/platform/connected-accounts/${accountId}/toggle`,
			{
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ isActive }),
			}
		);
		if (!response.ok) throw new Error("Failed to toggle platform");
	},

	async disconnectPlatform(platform: string): Promise<void> {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/platform/disconnect/${platform}`,
			{
				method: "DELETE",
				credentials: "include",
			}
		);
		if (!response.ok) throw new Error("Failed to disconnect platform");
	},

	initiateConnection(platform: string): void {
		window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/platform/connect/${platform}`;
	},
};
