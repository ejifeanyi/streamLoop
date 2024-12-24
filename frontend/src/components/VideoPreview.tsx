"use client";

import React, { useRef, useState, useEffect } from "react";
import { Settings, Video, VideoOff } from "lucide-react";
import { Button } from "./ui/button";

const VideoPreview = () => {
	const [isLive, setIsLive] = useState(false);
	const [isWebcamOn, setIsWebcamOn] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const startWebcam = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					setIsWebcamOn(true);
				}
			} catch (error) {
				console.error("Error accessing webcam:", error);
				alert("Could not access webcam. Please check permissions.");
			}
		};

		if (isLive && !isWebcamOn) {
			startWebcam();
		}
	}, [isLive, isWebcamOn]);

	const handleStartLive = () => setIsLive(true);
	const handleEndLive = () => {
		if (videoRef.current && videoRef.current.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => track.stop());
		}
		setIsLive(false);
		setIsWebcamOn(false);
	};

	return (
		<div className="relative flex flex-col h-full w-full bg-background text-foreground">
			{/* Video Section */}
			<div className="relative flex-1 bg-black">
				<video
					ref={videoRef}
					className="w-full h-full object-cover"
					autoPlay
					muted
				/>
				{!isWebcamOn && (
					<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
						<span className="text-xl font-semibold">
							{isLive ? "Connecting..." : "Start streaming"}
						</span>
					</div>
				)}
			</div>

			{/* Comments Overlay (Mobile) */}
			<div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-70 text-white p-4 sm:hidden">
				<h3 className="text-sm font-bold">Live Comments</h3>
				<p className="text-xs">No comments yet. Start interacting!</p>
			</div>

			{/* Control Buttons */}
			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 sm:bottom-8">
				<Button
					onClick={handleStartLive}
					className="bg-primary text-primary-foreground px-4 py-2"
				>
					<Video />
					<span>Go Live</span>
				</Button>
				<Button
					onClick={handleEndLive}
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
