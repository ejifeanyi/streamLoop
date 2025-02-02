export const streamApi = {
	async createStream(title: string) {
		const response = await fetch("/api/stream/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title,
				accountIds: [], // Add empty array as default if no accounts selected
				// Add other optional parameters
				quality: "1080p",
				bitrate: 2500,
				resolution: "1920x1080",
				frameRate: 30,
			}),
		});
		return response.json();
	},

	async startStream(streamId: string) {
		const response = await fetch(`/api/stream/${streamId}/start`, {
			method: "POST",
		});
		return response.json();
	},

	async endStream(streamId: string) {
		const response = await fetch(`/api/stream/${streamId}/end`, {
			method: "POST",
		});
		return response.json();
	},
};
