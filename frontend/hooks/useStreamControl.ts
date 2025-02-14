// hooks/useStreamControl.ts
import { useCallback, useState } from "react";
import { streamApi } from "@/lib/stream";
import type { StreamSession } from "../types/stream";

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

	const handleEndLive = useCallback(async () => {
		try {
			if (currentStreamId) {
				await streamApi.endStream(currentStreamId);
			}
		} catch (error) {
			console.error("Error ending stream:", error);
		} finally {
			cleanup();
			setCurrentStreamId(null);
			setIsLive(false);
		}
	}, [currentStreamId, cleanup]);

	const handleStartLive = useCallback(
		async (title: string) => {
			if (!streamRef.current || !title.trim()) {
				onError("Camera not ready or title is missing");
				return;
			}

			try {
				const session: StreamSession = await streamApi.createStream(title);
				setCurrentStreamId(session.id);
				const streamData = await streamApi.startStream(session.id);

				const ws = new WebSocket(
					`${
						window.location.protocol === "https:" ? "wss:" : "ws:"
					}//localhost:5001/ws`
				);
				wsRef.current = ws;

				ws.onopen = () => {
					ws.send(
						JSON.stringify({
							type: "config",
							streamId: session.id,
							rtmpUrl: streamData.rtmpUrl,
							streamKey: streamData.streamKey,
						})
					);

					try {
						const mediaRecorder = new MediaRecorder(streamRef.current!, {
							mimeType: "video/webm;codecs=h264,opus",
							videoBitsPerSecond: 2500000,
							audioBitsPerSecond: 128000,
						});

						mediaRecorder.ondataavailable = async (event) => {
							if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
								ws.send(await event.data.arrayBuffer());
							}
						};

						mediaRecorder.onerror = (event) => {
							console.error("MediaRecorder error:", event);
							handleEndLive();
						};

						mediaRecorderRef.current = mediaRecorder;
						mediaRecorder.start(1000);
						setIsLive(true);
						onError("");
					} catch (error) {
						throw new Error(
							`Failed to initialize stream encoder: ${
								error instanceof Error ? error.message : "Unknown error"
							}`
						);
					}
				};

				ws.onerror = (error) => {
					console.error("WebSocket error:", error);
					handleEndLive();
					onError("Failed to connect to streaming server");
				};

				ws.onclose = () => {
					if (isLive) {
						handleEndLive();
					}
				};
			} catch (error) {
				onError(
					error instanceof Error ? error.message : "Failed to start stream"
				);
				handleEndLive();
			}
		},
		[streamRef, wsRef, mediaRecorderRef, isLive, onError, handleEndLive]
	);

	return {
		isLive,
		handleStartLive,
		handleEndLive,
	};
};
