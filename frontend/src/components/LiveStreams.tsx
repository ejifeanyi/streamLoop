"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface LiveStream {
	id: number;
	title: string;
	image: string;
	date: string;
	duration: string;
}

const liveStreams: LiveStream[] = [
	{
		id: 1,
		title: "Live Coding Session",
		image: "https://via.placeholder.com/200",
		date: "Jan 10, 2024",
		duration: "1h 45m",
	},
	{
		id: 2,
		title: "Gaming Stream",
		image: "https://via.placeholder.com/200",
		date: "Jan 12, 2024",
		duration: "3h",
	},
	{
		id: 3,
		title: "Music Live",
		image: "https://via.placeholder.com/200",
		date: "Jan 15, 2024",
		duration: "2h 30m",
	},
];

const LiveStreams: React.FC = () => {
	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Recent Live Streams</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				{liveStreams.map((stream) => (
					<Card
						key={stream.id}
						className="relative h-[300px] rounded-lg overflow-hidden"
					>
						<img
							src={stream.image}
							alt={stream.title}
							className="absolute inset-0 h-full w-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90"></div>
						<div className="absolute bottom-0 left-0 p-4 text-white flex flex-col gap-2">
							<p className="text-lg font-bold">{stream.title}</p>
							<p className="text-sm text-gray-300 flex items-center gap-2">
								<Calendar className="text-xs" /> {stream.date}
							</p>
							<p className="text-sm text-gray-300 flex items-center gap-2">
								<Clock className="text-xs" /> {stream.duration}
							</p>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};

export default LiveStreams;
