// useStreamControl.ts
import { useCallback, useState } from "react";
import { Socket, StreamSession, StartStreamResponse } from "../types/stream";
import { streamApi } from "@/lib/stream";

interface UseStreamControlProps {
	streamRef: React.RefObject<MediaStream | null>;
	socketRef: React.RefObject<Socket | null>;
	cleanup: () => void;
	onError: (error: string) => void;
}

export const useStreamControl = ({
	streamRef,
	socketRef,
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

				if (!socketRef.current?.connected) {
					onError(
						"Not connected to streaming server. Please restart the camera."
					);
					return;
				}

				// Create a stream session
				const session: StreamSession = await streamApi.createStream(title);
				setCurrentStreamId(session.id);

				// Notify backend that we're starting the stream
				socketRef.current.emit(
					"startStream",
					{ streamId: session.id },
					({ success, error }: StartStreamResponse) => {
						if (!success) {
							onError(error || "Failed to start stream");
							cleanup();
							return;
						}

						console.log("Stream started successfully");
						setIsLive(true);
					}
				);
			} catch (error) {
				console.error("❌ Stream start error:", error);
				onError(
					error instanceof Error ? error.message : "Failed to start stream"
				);
				cleanup();
			}
		},
		[streamRef, socketRef, onError, cleanup]
	);

	const handleEndLive = useCallback(async () => {
		try {
			if (socketRef.current?.connected) {
				socketRef.current.emit("endStream");
			}

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
	}, [currentStreamId, cleanup, onError, socketRef]);

	return {
		isLive,
		handleStartLive,
		handleEndLive,
	};
};
