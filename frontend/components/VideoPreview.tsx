"use client";

import React, { useState, useEffect } from "react";
import { Video, VideoOff, Camera, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/app/AuthContext";
import { useMediaConstraints } from "../constants/mediaConfig";
import { useStreamSetup } from "../hooks/useStreamSetup";
import { useStreamControl } from "../hooks/useStreamControl";

const VideoPreview: React.FC = () => {
	const { user, loading, checkAuth } = useAuth();
	const [title, setTitle] = useState("");
	const [error, setError] = useState<string>("");

	const constraints = useMediaConstraints();
	const {
		isCameraReady,
		videoRef,
		streamRef,
		mediaRecorderRef,
		wsRef,
		startCamera,
		cleanup,
	} = useStreamSetup({ onError: setError });

	const { isLive, handleStartLive, handleEndLive } = useStreamControl({
		streamRef,
		wsRef,
		mediaRecorderRef,
		cleanup,
		onError: setError,
	});

	useEffect(() => {
		checkAuth();
		return () => {
			cleanup();
		};
	}, [checkAuth, cleanup]);

	if (loading) return <div>Loading...</div>;
	if (!user) return <div>Please sign in to start streaming</div>;

	const handleCameraStart = () => startCamera(constraints);

	return (
		<div className="relative flex flex-col h-full w-full bg-background text-foreground">
			<div className="relative flex-1 bg-black">
				<video
					ref={videoRef}
					className="w-full h-full object-cover transform scale-x-[-1]"
					autoPlay
					playsInline
					muted
				/>

				{!isCameraReady && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
						<div className="space-y-4 w-full max-w-md p-4">
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Enter stream title"
								className="w-full px-4 py-2 rounded bg-white text-black"
							/>

							<Button
								onClick={handleCameraStart}
								className="w-full bg-primary text-primary-foreground"
							>
								<Camera className="mr-2" />
								Start Camera
							</Button>
						</div>
					</div>
				)}
			</div>

			{error && (
				<Alert
					variant="destructive"
					className="absolute top-4 left-1/2 transform -translate-x-1/2 max-w-md"
				>
					<AlertDescription>
						{error}
						<Button
							onClick={handleCameraStart}
							className="ml-2 bg-primary text-primary-foreground"
						>
							<RefreshCcw className="mr-2 h-4 w-4" />
							Retry
						</Button>
					</AlertDescription>
				</Alert>
			)}

			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
				<Button
					onClick={() => handleStartLive(title)}
					disabled={isLive || !title || !isCameraReady}
					className="bg-primary text-primary-foreground px-4 py-2"
				>
					<Video className="mr-2" />
					<span>Go Live</span>
				</Button>
				<Button
					onClick={handleEndLive}
					disabled={!isLive}
					className="bg-destructive text-destructive-foreground px-4 py-2"
				>
					<VideoOff className="mr-2" />
					<span>End Live</span>
				</Button>
			</div>
		</div>
	);
};

export default VideoPreview;
