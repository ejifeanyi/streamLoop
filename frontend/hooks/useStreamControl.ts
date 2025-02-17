import { useCallback, useState } from "react";
import { streamApi } from "@/lib/stream";

interface UseStreamControlProps {
	streamRef: React.RefObject<MediaStream | null>;
	wsRef: React.RefObject<WebSocket | null>;
	mediaRecorderRef: React.RefObject<MediaRecorder | null>;
	cleanup: () => void;
	onError: (error: string) => void;
}

export const useStreamControl = ({
	streamRef,
	wsRef,
	mediaRecorderRef,
	cleanup,
	onError,
}: UseStreamControlProps) => {
	const [isLive, setIsLive] = useState(false);
	const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

	const getSupportedMimeType = () => {
		const types = [
			"video/webm;codecs=h264,opus",
			"video/webm;codecs=vp8,opus",
			"video/webm;codecs=vp9,opus",
			"video/webm",
		];

		console.log("🎥 Checking supported MIME types...");
		for (const type of types) {
			const isSupported = MediaRecorder.isTypeSupported(type);
			console.log(`${type}: ${isSupported ? "✅" : "❌"}`);
			if (isSupported) return type;
		}
		return "";
	};

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

	const handleStartLive = useCallback(
		async (title: string) => {
			if (!streamRef.current || !streamRef.current.active) {
				onError("Camera stream is not active - please restart camera");
				return;
			}

			if (!title.trim()) {
				onError("Please enter a stream title");
				return;
			}

			try {
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
					ws.send(
						JSON.stringify({
							type: "config",
							streamId: session.id,
							rtmpUrl: streamData.youtubeData.rtmpUrl,
							streamKey: streamData.youtubeData.streamKey,
						})
					);

					const mediaRecorder = new MediaRecorder(streamRef.current!, {
						mimeType: getSupportedMimeType(),
						videoBitsPerSecond: 2500000,
						audioBitsPerSecond: 128000,
					});

					mediaRecorder.ondataavailable = async (event) => {
						if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
							ws.send(await event.data.arrayBuffer());
						}
					};

					mediaRecorderRef.current = mediaRecorder;
					mediaRecorder.start(1000);
					setIsLive(true);
				};
			} catch (error) {
				console.error("❌ Stream start error:", error);
				onError(
					error instanceof Error ? error.message : "Failed to start stream"
				);
			}
		},
		[streamRef, wsRef, mediaRecorderRef, onError]
	);

	return {
		isLive,
		handleStartLive,
		handleEndLive,
	};
};
