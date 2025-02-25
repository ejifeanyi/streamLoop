export const streamApi = {
	async createStream(title: string, options = { useYouTube: false }) {
		// First, create the stream in your database
		const response = await fetch("http://localhost:5000/api/stream/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				title,
				accountIds: [],
				quality: "1080p",
				bitrate: 4000000,
				resolution: "1920x1080",
				frameRate: 30,
				videoCodec: "h264",
				audioCodec: "aac",
				audioRate: "128k",
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Stream creation failed:", errorText);
			throw new Error(
				`Failed to create stream: ${response.status} - ${errorText}`
			);
		}

		const streamData = await response.json();

		// Only create YouTube broadcast if option is enabled
		if (options.useYouTube) {
			try {
				const youtubeResponse = await fetch(
					"/api/platform/youtube/create-broadcast",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
						body: JSON.stringify({
							title,
							description: "Live stream from my app",
							scheduledStartTime: new Date().toISOString(),
						}),
					}
				);

				if (youtubeResponse.ok) {
					const youtubeData = await youtubeResponse.json();
					return {
						...streamData,
						youtubeData: {
							rtmpUrl: youtubeData.rtmpUrl,
							streamKey: youtubeData.streamKey,
						},
					};
				} else {
					console.warn(
						"YouTube broadcast creation failed, continuing with local stream only"
					);
				}
			} catch (error) {
				console.warn("YouTube integration error:", error);
			}
		}

		// Return stream data without YouTube information
		return streamData;
	},

	async startStream(streamId: string) {
		const response = await fetch(`/api/stream/${streamId}/start`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Stream start failed:", errorText);
			throw new Error(
				`Failed to start stream: ${response.status} - ${errorText}`
			);
		}

		const data = await response.json();
		console.log(`stream start response:`, data);

		// Don't require YouTube data
		return data;
	},

	async endStream(streamId: string) {
		const response = await fetch(`/api/stream/${streamId}/end`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Stream end failed:", errorText);
			throw new Error(
				`Failed to end stream: ${response.status} - ${errorText}`
			);
		}

		return response.json();
	},

	// Add a method to check auth status
	async checkAuth() {
		try {
			const response = await fetch("/api/auth/check", {
				method: "GET",
				credentials: "include", // Ensures cookies are sent
			});

			if (!response.ok) throw new Error("Failed to verify auth");

			const data = await response.json();
			console.log("Full auth check response:", data); // Detailed logging
			return data.authenticated; // Directly use the 'authenticated' field
		} catch (error) {
			console.error("Auth check error:", error);
			return false;
		}
	},
};
