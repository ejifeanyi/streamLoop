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
	const [currentQuality, setCurrentQuality] = useState("720p");
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const cleanupInProgressRef = useRef(false);

	const cleanup = useCallback(() => {
		if (!shouldCleanup || cleanupInProgressRef.current) {
			console.log("Cleanup skipped - not initialized or already in progress");
			return;
		}

		cleanupInProgressRef.current = true;
		console.log("🔍 Cleanup called");

		try {
			if (mediaRecorderRef.current?.state === "recording") {
				mediaRecorderRef.current.stop();
			}

			if (
				wsRef.current?.readyState === WebSocket.OPEN ||
				wsRef.current?.readyState === WebSocket.CONNECTING
			) {
				wsRef.current.close();
			}

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
					await videoRef.current.play();
					setIsCameraReady(true);
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

	const updateStreamQuality = useCallback((quality: string) => {
		setCurrentQuality(quality);
	}, []);

	return {
		isCameraReady,
		videoRef,
		streamRef,
		mediaRecorderRef,
		wsRef,
		startCamera,
		cleanup,
		currentQuality,
		updateStreamQuality,
	};
};
