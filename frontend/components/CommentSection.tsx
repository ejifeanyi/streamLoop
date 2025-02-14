import React from "react";

const CommentSection = () => {
	return (
		<div className="w-full sm:w-1/3 h-full bg-muted text-muted-foreground p-4 overflow-y-auto hidden sm:block flex-1">
			<h2 className="text-lg font-bold mb-4">Live Comments</h2>
			<div className="flex flex-col gap-2">
				<p className="text-sm">No comments yet. Start interacting!</p>
			</div>
		</div>
	);
};

export default CommentSection;
