import VideoPreview from "@/components/VideoPreview";

type Props = {};

const page = (props: Props) => {
	return (
		<div className="flex flex-col sm:flex-row h-screen w-full bg-background text-foreground">
			{/* Video Section */}
			<div className="flex-1">
				<VideoPreview />
			</div>

			{/* Comments Section (Hidden on Mobile) */}
			<div className="w-full sm:w-1/3 h-auto sm:h-full bg-muted text-muted-foreground p-4 overflow-auto hidden sm:block">
				<h2 className="text-lg font-bold mb-4">Live Comments</h2>
				<div className="flex flex-col gap-2">
					<p className="text-sm">No comments yet. Start interacting!</p>
				</div>
			</div>
		</div>
	);
};

export default page;
