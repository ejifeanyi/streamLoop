"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "../AuthContext";
import { useRouter } from "next/navigation";
import VideoPreview from "@/components/VideoPreview";
import CommentSection from "@/components/CommentSection";

const Page: React.FC = () => {
	const { user, loading } = useAuth();
	const router = useRouter();

	if (!user) router.push("/");

	if (loading) {
		return (
			<div className="mt-8">
				<Skeleton className="h-4 w-[250px]" />
			</div>
		);
	}

	const userFirstName = user?.name.split(" ")[0] || "User";

	return (
		<div className="flex flex-col h-screen max-h-screen overflow-hidden w-full max-w-[1300px] mx-auto">
			<h1 className="text-foreground text-xl font-medium mb-4">
				Hi {userFirstName}, let&apos;s start streaming!
			</h1>

			<div className="flex flex-col sm:flex-row flex-1 sm:gap-10 bg-background text-foreground overflow-hidden">
				<div className="flex-1 h-full">
					<VideoPreview />
				</div>

				<CommentSection />
			</div>
		</div>
	);
};

export default Page;
