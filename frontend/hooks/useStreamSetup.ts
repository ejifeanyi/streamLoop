// useStreamSetup.ts
import { useCallback, useRef, useState } from "react";
import {
	MediaConstraints,
	AuthResponse,
	TransportResponse,
	ConnectResponse,
	ProduceResponse,
	Socket,
} from "../types/stream";
import { Device } from "mediasoup-client";
import { Transport, Producer } from "mediasoup-client/lib/types";
import socketio from "socket.io-client";

interface UseStreamSetupProps {
	onError: (error: string) => void;
	shouldCleanup: boolean;
}

export const useStreamSetup = ({
	onError,
	shouldCleanup,
}: UseStreamSetupProps) => {
	const [isCameraReady, setIsCameraReady] = useState(false);
	const [currentQuality, setCurrentQuality] = useState("720p");
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const deviceRef = useRef<Device | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const producerTransportRef = useRef<Transport | null>(null);
	const producersRef = useRef<Map<string, Producer>>(new Map());
	const cleanupInProgressRef = useRef(false);

	const cleanup = useCallback(() => {
		if (!shouldCleanup || cleanupInProgressRef.current) {
			console.log("Cleanup skipped - not initialized or already in progress");
			return;
		}

		cleanupInProgressRef.current = true;
		console.log("🔍 Cleanup called");

		try {
			// Close all producers
			for (const producer of producersRef.current.values()) {
				producer.close();
			}
			producersRef.current.clear();

			// Close transport
			if (producerTransportRef.current) {
				producerTransportRef.current.close();
				producerTransportRef.current = null;
			}

			// Close socket connection
			if (socketRef.current?.connected) {
				socketRef.current.disconnect();
			}

			// Stop media tracks
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => {
					if (track.readyState === "live") {
						track.stop();
					}
				});
			}

			if (videoRef.current) {
				videoRef.current.srcObject = null;
			}

			deviceRef.current = null;
			socketRef.current = null;
			streamRef.current = null;
			setIsCameraReady(false);
		} catch (error) {
			console.error("Cleanup error:", error);
		} finally {
			cleanupInProgressRef.current = false;
		}
	}, [shouldCleanup]);

	const initializeWebRTC = useCallback(
		async (userId: string) => {
			try {
				// Connect to WebRTC signaling server
				// With this:
				const serverUrl =
					process.env.NEXT_PUBLIC_WEBRTC_SERVER_URL || "http://localhost:5000";

				const socket = socketio(`${serverUrl}/webrtc`, {
					path: "/socket.io",
					transports: ["websocket", "polling"],
				});

				socketRef.current = socket;

				// Handle socket connection events
				socket.on("connect", async () => {
					console.log("Connected to signaling server");

					// Authenticate with socket
					socket.emit(
						"authenticate",
						{ userId },
						async ({ success, rtpCapabilities, error }: AuthResponse) => {
							if (!success) {
								onError(
									error || "Failed to authenticate with signaling server"
								);
								return;
							}

							// Create mediasoup device
							try {
								const device = new Device();
								if (rtpCapabilities) {
									await device.load({ routerRtpCapabilities: rtpCapabilities });
									deviceRef.current = device;
									console.log("MediaSoup device created successfully");
								} else {
									throw new Error("Missing RTP capabilities");
								}
							} catch (error) {
								console.error("Failed to create mediasoup device:", error);
								onError("Failed to initialize streaming components");
							}
						}
					);
				});

				socket.on("disconnect", () => {
					console.log("Disconnected from signaling server");
					cleanup();
				});

				socket.on("connect_error", (error: Error) => {
					console.error("Socket connection error:", error);
					onError("Failed to connect to streaming server");
				});
			} catch (error) {
				console.error("WebRTC initialization error:", error);
				onError("Failed to initialize streaming components");
			}
		},
		[cleanup, onError]
	);
	

	const createProducerTransport = useCallback(async () => {
		if (!deviceRef.current || !socketRef.current) {
			onError("Streaming components not initialized");
			return false;
		}

		return new Promise<boolean>((resolve, reject) => {
			socketRef.current?.emit(
				"createWebRtcTransport",
				{},
				async ({ success, transport, error }: TransportResponse) => {
					if (!success || !transport) {
						console.error("Failed to create producer transport:", error);
						reject(error);
						return;
					}

					try {
						// Create Send Transport
						const producerTransport = deviceRef.current!.createSendTransport({
							id: transport.id,
							iceParameters: transport.iceParameters,
							iceCandidates: transport.iceCandidates,
							dtlsParameters: transport.dtlsParameters,
						});

						// Set up transport events
						producerTransport.on(
							"connect",
							({ dtlsParameters }, callback, errback) => {
								socketRef.current?.emit(
									"connectTransport",
									{
										transportId: producerTransport.id,
										dtlsParameters,
									},
									({ success, error }: ConnectResponse) => {
										if (success) {
											callback();
										} else {
											errback(new Error(error));
										}
									}
								);
							}
						);

						producerTransport.on(
							"produce",
							({ kind, rtpParameters }, callback, errback) => {
								socketRef.current?.emit(
									"produce",
									{
										transportId: producerTransport.id,
										kind,
										rtpParameters,
									},
									({ success, producerId, error }: ProduceResponse) => {
										if (success && producerId) {
											callback({ id: producerId });
										} else {
											errback(new Error(error));
										}
									}
								);
							}
						);

						producerTransport.on("connectionstatechange", (state) => {
							console.log(`Producer transport state changed to ${state}`);
							if (state === "failed" || state === "closed") {
								cleanup();
							}
						});

						producerTransportRef.current = producerTransport;
						resolve(true);
					} catch (error) {
						console.error("Transport creation error:", error);
						reject(error);
					}
				}
			);
		});
	}, [cleanup, onError]);

	const createProducers = useCallback(async () => {
		if (!streamRef.current || !producerTransportRef.current) {
			onError("Stream or transport not initialized");
			return;
		}

		try {
			// Create producers for each track in the stream
			for (const track of streamRef.current.getTracks()) {
				const producer = await producerTransportRef.current.produce({ track });

				producer.on("trackended", () => {
					console.log(`Track ended: ${track.kind}`);
					producer.close();
					producersRef.current.delete(track.kind);
				});

				producersRef.current.set(track.kind, producer);
				console.log(`${track.kind} producer created:`, producer.id);
			}

			console.log("All producers created successfully");
		} catch (error) {
			console.error("Error creating producers:", error);
			onError("Failed to create media producers");
			cleanup();
		}
	}, [cleanup, onError]);

	const startCamera = useCallback(
		async (constraints: MediaConstraints, userId: string) => {
			try {
				if (streamRef.current) {
					cleanup();
				}

				console.log("Starting camera with constraints:", constraints);
				const stream = await navigator.mediaDevices.getUserMedia(constraints);

				if (!stream || stream.getTracks().length === 0) {
					throw new Error("Failed to get camera stream or no tracks available");
				}

				streamRef.current = stream;

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					await videoRef.current.play();
					setIsCameraReady(true);

					// Initialize WebRTC components
					await initializeWebRTC(userId);

					// Create a transport
					await createProducerTransport();

					// Create producers for audio and video
					await createProducers();

					console.log("Camera and WebRTC setup completed successfully");
				} else {
					throw new Error("Video element not found");
				}
			} catch (error) {
				console.error("Camera start error:", error);
				cleanup();
				onError(
					error instanceof Error ? error.message : "Failed to start camera"
				);
			}
		},
		[
			cleanup,
			onError,
			initializeWebRTC,
			createProducerTransport,
			createProducers,
		]
	);

	const updateStreamQuality = useCallback((quality: string) => {
		setCurrentQuality(quality);
	}, []);

	return {
		isCameraReady,
		videoRef,
		streamRef,
		socketRef,
		startCamera,
		cleanup,
		currentQuality,
		updateStreamQuality,
	};
};
