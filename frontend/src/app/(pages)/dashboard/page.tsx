"use client";

import React from "react";
import OverviewCard from "@/components/OverviewCard";
import LiveStreams from "@/components/LiveStreams";

const Dashboard: React.FC = () => {
	return (
		<div className="">
			<OverviewCard />
			<LiveStreams />
		</div>
	);
};

export default Dashboard;
