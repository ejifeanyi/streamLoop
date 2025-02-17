export const streamApi = {
	async createStream(title: string) {
		// First, create the stream in your database
		const response = await fetch("/api/stream/create", {
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

		// Create a YouTube live broadcast
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
					description: "Live stream from my app", // Customize this
					scheduledStartTime: new Date().toISOString(), // Start immediately
				}),
			}
		);

		if (!youtubeResponse.ok) {
			const errorText = await youtubeResponse.text();
			console.error("YouTube broadcast creation failed:", errorText);
			throw new Error(`Failed to create YouTube broadcast: ${errorText}`);
		}

		const youtubeData = await youtubeResponse.json();

		// Return both stream data and YouTube broadcast details
		return {
			...streamData,
			youtubeData: {
				rtmpUrl: youtubeData.rtmpUrl,
				streamKey: youtubeData.streamKey,
			},
		};
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
