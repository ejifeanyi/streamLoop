import { useCallback, useRef, useState } from "react";
import type { MediaConstraints } from "../types/stream";

interface UseStreamSetupProps {
	onError: (error: string) => void;
	shouldCleanup: boolean;
}

export const useStreamSetup = ({
	onError,
	shouldCleanup,
}: UseStreamSetupProps) => {
	const [isCameraReady, setIsCameraReady] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const cleanupInProgressRef = useRef(false);

	const cleanup = useCallback(() => {
		if (!shouldCleanup) {
			console.log("Cleanup skipped - not initialized");
			return;
		}

		if (cleanupInProgressRef.current) {
			console.log("Cleanup already in progress");
			return;
		}

		cleanupInProgressRef.current = true;
		console.log("🔍 Cleanup called");

		try {
			if (
				mediaRecorderRef.current &&
				mediaRecorderRef.current.state === "recording"
			) {
				mediaRecorderRef.current.stop();
			}

			if (
				wsRef.current &&
				(wsRef.current.readyState === WebSocket.OPEN ||
					wsRef.current.readyState === WebSocket.CONNECTING)
			) {
				wsRef.current.close();
			}

			if (streamRef.current) {
				const tracks = streamRef.current.getTracks();
				tracks.forEach((track) => {
					if (track.readyState === "live") {
						track.stop();
					}
				});
			}

			if (videoRef.current) {
				videoRef.current.srcObject = null;
			}

			mediaRecorderRef.current = null;
			wsRef.current = null;
			streamRef.current = null;
			setIsCameraReady(false);
		} catch (error) {
			console.error("Cleanup error:", error);
		} finally {
			cleanupInProgressRef.current = false;
		}
	}, [shouldCleanup]);

	const startCamera = useCallback(
		async (constraints: MediaConstraints) => {
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
					try {
						await videoRef.current.play();
						setIsCameraReady(true);
					} catch (playError) {
						throw new Error(
							`Failed to play video: ${
								playError instanceof Error ? playError.message : "Unknown error"
							}`
						);
					}
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
		[cleanup, onError]
	);

	return {
		isCameraReady,
		videoRef,
		streamRef,
		mediaRecorderRef,
		wsRef,
		startCamera,
		cleanup,
	};
};
