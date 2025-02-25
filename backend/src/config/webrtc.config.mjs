// src/config/webrtc.config.mjs
export const webRTCConfig = {
	mediasoup: {
		worker: {
			rtcMinPort: 10000,
			rtcMaxPort: 10100,
			logLevel: "warn",
			logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
		},
		router: {
			mediaCodecs: [
				{
					kind: "audio",
					mimeType: "audio/opus",
					clockRate: 48000,
					channels: 2,
				},
				{
					kind: "video",
					mimeType: "video/VP8",
					clockRate: 90000,
					parameters: {
						"x-google-start-bitrate": 1000,
					},
				},
				{
					kind: "video",
					mimeType: "video/H264",
					clockRate: 90000,
					parameters: {
						"packetization-mode": 1,
						"profile-level-id": "42e01f",
						"level-asymmetry-allowed": 1,
					},
				},
			],
		},
		webRtcTransport: {
			listenIps: [
				{
					ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
					announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || null,
				},
			],
			initialAvailableOutgoingBitrate: 1000000,
			minimumAvailableOutgoingBitrate: 600000,
			maxSctpMessageSize: 262144,
			maxIncomingBitrate: 1500000,
		},
	},
};
