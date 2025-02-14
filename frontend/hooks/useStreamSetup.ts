import { useCallback, useRef, useState } from "react";
import type { MediaConstraints } from "../types/stream";

interface UseStreamSetupProps {
	onError: (error: string) => void;
}

export const useStreamSetup = ({ onError }: UseStreamSetupProps) => {
	const [isCameraReady, setIsCameraReady] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	const cleanup = useCallback(() => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				try {
					track.stop();
				} catch (e) {
					console.error("Error stopping track:", e);
				}
			});
			streamRef.current = null;
		}

		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}

		if (mediaRecorderRef.current?.state !== "inactive") {
			try {
				mediaRecorderRef.current?.stop();
			} catch (e) {
				console.error("Error stopping MediaRecorder:", e);
			}
			mediaRecorderRef.current = null;
		}

		if (wsRef.current?.readyState === WebSocket.OPEN) {
			try {
				wsRef.current?.close();
			} catch (e) {
				console.error("Error closing WebSocket:", e);
			}
			wsRef.current = null;
		}

		setIsCameraReady(false);
	}, []);

	const startCamera = useCallback(
		async (constraints: MediaConstraints) => {
			try {
				cleanup();
				onError("");

				console.log("Requesting media with constraints:", constraints);
				const stream = await navigator.mediaDevices.getUserMedia(constraints);

				const videoTrack = stream.getVideoTracks()[0];
				console.log("Active track settings:", videoTrack.getSettings());

				videoTrack.addEventListener("ended", () => {
					console.log("Video track ended");
					cleanup();
					onError("Camera disconnected");
				});

				streamRef.current = stream;

				if (videoRef.current) {
					videoRef.current.srcObject = stream;

					await new Promise<void>((resolve) => {
						if (videoRef.current) {
							videoRef.current.onloadedmetadata = () => resolve();
						}
					});

					await videoRef.current.play();
					setIsCameraReady(true);
				} else {
					throw new Error("Video element not found");
				}
			} catch (error) {
				console.error("Camera start error:", error);
				cleanup();
				onError(
					`Failed to start camera: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
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
