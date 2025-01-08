"use client";

import React from "react";
import OverviewCard from "@/components/OverviewCard";
import LiveStreams from "@/components/LiveStreams";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard: React.FC = () => {
	const { user, loading } = useAuth();

	if (loading) {
		return <div className="text-center mt-8">Loading...</div>;
	}

	if (!user) {
		return (
			<div className="mt-8">
				<h1 className="text-xl text-gray-600">Please sign in to continue!</h1>
			</div>
		);
	}

	const userFirstName = user.name?.split(" ")[0] || "User";

	return (
		<div>
			<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white p-4">
				Welcome {userFirstName}
			</h1>
			<OverviewCard />
			<LiveStreams />
		</div>
	);
};

export default Dashboard;
