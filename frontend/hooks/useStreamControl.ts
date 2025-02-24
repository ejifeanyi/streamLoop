import { streamApi } from "@/lib/stream";
import { useCallback, useState } from "react";

interface UseStreamControlProps {
	streamRef: React.RefObject<MediaStream | null>;
	wsRef: React.RefObject<WebSocket | null>;
	mediaRecorderRef: React.RefObject<MediaRecorder | null>;
	cleanup: () => void;
	onError: (error: string) => void;
}

const getSupportedMimeType = () => {
	const types = [
		"video/webm;codecs=vp9",
		"video/webm;codecs=vp8",
		"video/webm",
	];
	return types.find((type) => MediaRecorder.isTypeSupported(type));
};

export const useStreamControl = ({
	streamRef,
	wsRef,
	mediaRecorderRef,
	cleanup,
	onError,
}: UseStreamControlProps) => {
	const [isLive, setIsLive] = useState(false);
	const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

	const handleStartLive = useCallback(
		async (title: string) => {
			if (!title.trim()) {
				onError("Please enter a stream title");
				return;
			}

			try {
				if (!streamRef.current?.active) {
					onError("Camera stream is not active. Please start camera first.");
					return;
				}

				const session = await streamApi.createStream(title);
				setCurrentStreamId(session.id);
				const streamData = await streamApi.startStream(session.id);

				const wsUrl = `${
					window.location.protocol === "https:" ? "wss:" : "ws:"
				}//localhost:5001/ws`;
				const ws = new WebSocket(wsUrl);
				wsRef.current = ws;

				ws.onopen = () => {
					console.log("🌐 WebSocket connected");
					console.log("RTMP Details:", {
						rtmpUrl: streamData.rtmpUrl,
						streamKey: streamData.streamKey,
					});
					try {
        ws.send(JSON.stringify({ type: "ping" }));
        console.log("Ping sent successfully");
    } catch (err) {
        console.error("Failed to send ping:", err);
    }

					if (!streamRef.current?.active) {
						console.error(
							"Stream validation failed after WebSocket connection"
						);
						onError("Stream became inactive during setup");
						ws.close();
						return;
					}

					ws.send(JSON.stringify({ type: "test" }));

					ws.send(
						JSON.stringify({
							type: "config",
							streamId: session.id,
							rtmpUrl: streamData.youtubeData.rtmpUrl,
							streamKey: streamData.youtubeData.streamKey,
						})
					);

					const mimeType = getSupportedMimeType();
					if (!mimeType) {
						onError("No supported video format found");
						ws.close();
						return;
					}

					try {
						const mediaRecorder = new MediaRecorder(streamRef.current, {
							mimeType,
							videoBitsPerSecond: 2500000,
							audioBitsPerSecond: 128000,
						});

						mediaRecorderRef.current = mediaRecorder;

						mediaRecorder.ondataavailable = async (event) => {
							console.log(`📦 Data size: ${event.data.size}`);
							if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
								try {
									const buffer = await event.data.arrayBuffer();
									ws.send(buffer);
									console.log("📤 Sent data to WebSocket");
								} catch (err) {
									console.error("❌ Error sending data:", err);
								}
							}
						};

						mediaRecorder.start(1000);
						setIsLive(true);
					} catch (error) {
						console.error("MediaRecorder initialization error:", error);
						onError("Failed to initialize recording");
						ws.close();
					}
				};

				ws.onerror = (error) => {
					console.error("WebSocket error:", error);
					onError("WebSocket connection failed");
					cleanup();
				};

				ws.onclose = () => {
					console.log("WebSocket closed");
					if (isLive) {
						setIsLive(false);
						cleanup();
					}
				};
			} catch (error) {
				console.error("❌ Stream start error:", error);
				onError(
					error instanceof Error ? error.message : "Failed to start stream"
				);
				cleanup();
			}
		},
		[streamRef, wsRef, mediaRecorderRef, onError, cleanup, isLive]
	);

	const handleEndLive = useCallback(async () => {
		try {
			if (currentStreamId) {
				await streamApi.endStream(currentStreamId);
			}
		} catch (error) {
			console.error("Error ending stream:", error);
			onError("Failed to end stream");
		} finally {
			setIsLive(false);
			setCurrentStreamId(null);
			cleanup();
		}
	}, [currentStreamId, cleanup, onError]);

	return {
		isLive,
		handleStartLive,
		handleEndLive,
	};
};
