"use client";

import React, { useRef, useState, useEffect } from "react";
import { Settings, Video, VideoOff } from "lucide-react";
import { Button } from "./ui/button";
import { streamApi } from "@/lib/api/stream";
import { NetworkMonitor } from "@/lib/network-monitor";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

const VideoPreview = () => {
	const [isLive, setIsLive] = useState(false);
	const [title, setTitle] = useState("");
	const videoRef = useRef<HTMLVideoElement>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
	const [currentQuality, setCurrentQuality] = useState("high");
	const chunkCounterRef = useRef(0);
	const retryQueuesRef = useRef(new Map());

	useEffect(() => {
		const networkMonitor = NetworkMonitor.getInstance();
		networkMonitor.onQualityChange((quality) => {
			setCurrentQuality(quality);
		});
	}, []);

	  const sendChunkWithRetry = async (formData: FormData, attempt = 1) => {
			try {
				const response = await fetch(`/api/stream/${currentStreamId}/push`, {
					method: "POST",
					body: formData,
					headers: {
						"X-Chunk-Number": formData.get("chunkNumber") as string,
						"X-Quality": currentQuality,
					},
				});

				if (!response.ok)
					throw new Error(`HTTP error! status: ${response.status}`);
				return true;
			} catch (error) {
				console.error(`Attempt ${attempt} failed:`, error);

				if (attempt < MAX_RETRY_ATTEMPTS) {
					await new Promise((resolve) =>
						setTimeout(resolve, RETRY_DELAY * attempt)
					);
					return sendChunkWithRetry(formData, attempt + 1);
				} else {
					const chunkNumber = formData.get("chunkNumber") as string;
					retryQueuesRef.current.set(chunkNumber, formData);
					return false;
				}
			}
	};
	
	const handleDataAvailable = async (event: BlobEvent) => {
		if (event.data.size > 0) {
			const formData = new FormData();
			formData.append("video", event.data);
			formData.append("chunkNumber", String(chunkCounterRef.current++));

			// Try to send any failed chunks first
			for (const [
				chunkNumber,
				failedFormData,
			] of retryQueuesRef.current.entries()) {
				if (await sendChunkWithRetry(failedFormData)) {
					retryQueuesRef.current.delete(chunkNumber);
				}
			}

			// Send current chunk
			await sendChunkWithRetry(formData);
		}
	};

	const handleStartLive = async () => {
		try {
			// 1. Get webcam stream
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
			streamRef.current = stream;

			// 2. Show preview
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}

			// 3. Create stream session on backend with proper error handling
			let session;
			try {
				session = await streamApi.createStream(title);
				if (!session?.id) {
					throw new Error("Failed to create stream session");
				}
				setCurrentStreamId(session.id);
			} catch (error) {
				console.error("Failed to create stream:", error);
				throw new Error("Failed to initialize stream");
			}

			// 4. Create MediaRecorder
			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: "video/webm;codecs=h264",
			});

			// 5. Connect to RTMP server
			const rtmpUrl = `rtmp://localhost:1935/live/${session.streamKey}`;

			mediaRecorder.ondataavailable = async (event) => {
				if (event.data.size > 0) {
					// Send data to RTMP server
					const formData = new FormData();
					formData.append("video", event.data);

					await fetch(`/api/stream/${session.id}/push`, {
						method: "POST",
						body: formData,
					});
				}
			};

			mediaRecorder.start(1000); // Collect data every second
			mediaRecorderRef.current = mediaRecorder;

			// 6. Start stream on backend
			await streamApi.startStream(session.id);
			setIsLive(true);
		} catch (error) {
			console.error("Error starting stream:", error);
			alert("Could not start stream. Please check permissions.");
		}
	};

	const handleEndLive = async () => {
		try {
			// 1. Stop MediaRecorder
			if (mediaRecorderRef.current) {
				mediaRecorderRef.current.stop();
			}

			// 2. Stop all tracks
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
			}

			// 3. End stream on backend
			if (currentStreamId) {
				await streamApi.endStream(currentStreamId);
			}

			// 4. Reset state
			setIsLive(false);
			setCurrentStreamId(null);
			if (videoRef.current) {
				videoRef.current.srcObject = null;
			}
		} catch (error) {
			console.error("Error ending stream:", error);
		}
	};

	// mediaRecorder.ondataavailable = async (event) => {
	// 	if (event.data.size > 0) {
	// 		const formData = new FormData();
	// 		formData.append("video", event.data);
	// 		formData.append("chunkNumber", chunkCounter++); // Add chunk number tracking

	// 		try {
	// 			await fetch(`/api/stream/${session.id}/push`, {
	// 				method: "POST",
	// 				body: formData,
	// 				headers: {
	// 					"X-Chunk-Number": chunkCounter,
	// 				},
	// 			});
	// 		} catch (error) {
	// 			console.error("Failed to send chunk:", error);
	// 			// Implement retry logic here
	// 		}
	// 	}
	// };

	return (
		<div className="relative flex flex-col h-full w-full bg-background text-foreground">
			{/* Video Preview */}
			<div className="relative flex-1 bg-black">
				<video
					ref={videoRef}
					className="w-full h-full object-cover"
					autoPlay
					muted
				/>
				{!isLive && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter stream title"
							className="px-4 py-2 rounded bg-white text-black mb-4"
						/>
						<span className="text-xl font-semibold">Start streaming</span>
					</div>
				)}
			</div>

			{/* Control Buttons */}
			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 sm:bottom-8">
				<Button
					onClick={handleStartLive}
					disabled={isLive || !title}
					className="bg-primary text-primary-foreground px-4 py-2"
				>
					<Video />
					<span>Go Live</span>
				</Button>
				<Button
					onClick={handleEndLive}
					disabled={!isLive}
					className="bg-destructive text-destructive-foreground px-4 py-2"
				>
					<VideoOff />
					<span>End Live</span>
				</Button>
				<Button className="bg-muted text-muted-foreground px-4 py-2">
					<Settings />
					<span>Settings</span>
				</Button>
			</div>
		</div>
	);
};

export default VideoPreview;
