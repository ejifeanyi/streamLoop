import React from "react";
import { Skeleton } from "./ui/skeleton";

const Loader = () => {
	return (
		<div className="grid md:grid-cols-2 gap-8 mb-16">
			<div className="space-y-6">
				<Skeleton className="h-16 w-full" /> {/* Main Headline */}
				<Skeleton className="h-8 w-3/4" /> {/* Subheadline */}
				<div className="flex space-x-4">
					<Skeleton className="h-12 w-32" /> {/* Primary CTA */}
					<Skeleton className="h-12 w-32" /> {/* Secondary CTA */}
				</div>
			</div>
			<div>
				<Skeleton className="h-[400px] w-full" /> {/* Hero Image */}
			</div>

			{/* Features Section Skeleton */}
			<div className="grid md:grid-cols-3 gap-6 mb-16">
				{[1, 2, 3].map((item) => (
					<div key={item} className="space-y-4">
						<Skeleton className="h-16 w-16 rounded-full mx-auto" />{" "}
						{/* Feature Icon */}
						<Skeleton className="h-6 w-3/4 mx-auto" /> {/* Feature Title */}
						<Skeleton className="h-16 w-full" /> {/* Feature Description */}
					</div>
				))}
			</div>
		</div>
	);
};

export default Loader;
