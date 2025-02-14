export const streamApi = {
	async createStream(title: string) {
		const response = await fetch("/api/stream/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include", // Important for Passport.js sessions
			body: JSON.stringify({
				title,
				accountIds: [],
				quality: "1080p",
				bitrate: 4000000, // Increased to 4Mbps for better quality
				resolution: "1920x1080",
				frameRate: 30,
				videoCodec: "h264", // Explicitly set video codec
				audioCodec: "aac", // Explicitly set audio codec
				audioRate: "128k", // Set audio bitrate
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Stream creation failed:", errorText);
			throw new Error(
				`Failed to create stream: ${response.status} - ${errorText}`
			);
		}

		return response.json();
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

		// Check for youtubeData with the correct property names
		if (!data.youtubeData?.rtmpUrl || !data.youtubeData?.streamName) {
			console.error("full response data:", data);
			throw new Error("Missing RTMP connection details");
		}

		return {
			...data,
			youtubeData: {
				rtmpUrl: data.youtubeData.rtmpUrl,
				streamKey: data.youtubeData.streamName, // Use streamName as streamKey
			},
		};
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
