"use client";

import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
	CartesianGrid,
	Line,
	LineChart,
	Pie,
	PieChart,
	Bar,
	BarChart,
	LabelList,
	Line as LineGraph,
	XAxis,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartConfig,
} from "@/components/ui/chart";

// Total Views Chart Data and Config
const totalViewsData = [
	{ month: "January", desktop: 186, mobile: 80 },
	{ month: "February", desktop: 305, mobile: 200 },
	{ month: "March", desktop: 237, mobile: 120 },
	{ month: "April", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "June", desktop: 214, mobile: 140 },
];
const totalViewsConfig: ChartConfig = {
	desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
	mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
};

// New Followers Chart Data and Config
const newFollowersData = [
	{ browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
	{ browser: "safari", visitors: 200, fill: "var(--color-safari)" },
	{ browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
	{ browser: "edge", visitors: 173, fill: "var(--color-edge)" },
	{ browser: "other", visitors: 190, fill: "var(--color-other)" },
];
const newFollowersConfig: ChartConfig = {
	chrome: { label: "Chrome", color: "hsl(var(--chart-1))" },
	safari: { label: "Safari", color: "hsl(var(--chart-2))" },
	firefox: { label: "Firefox", color: "hsl(var(--chart-3))" },
	edge: { label: "Edge", color: "hsl(var(--chart-4))" },
	other: { label: "Other", color: "hsl(var(--chart-5))" },
};

// Engagement Rate Chart Data and Config
const engagementRateData = [
	{ month: "January", desktop: 186 },
	{ month: "February", desktop: 305 },
	{ month: "March", desktop: 237 },
	{ month: "April", desktop: 73 },
	{ month: "May", desktop: 209 },
	{ month: "June", desktop: 214 },
];
const engagementRateConfig: ChartConfig = {
	desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
};

const OverviewCard = () => {
	return (
		<>
			<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white p-4">
				Welcome Dave
			</h1>
			<div className="grid gap-6 md:grid-cols-3">
				{/* Total Views */}
				<Card>
					<CardHeader>
						<CardTitle>Total Views</CardTitle>
						<CardDescription>January - June 2024</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer config={totalViewsConfig}>
							<LineChart
								data={totalViewsData}
								margin={{ left: 12, right: 12 }}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={(value) => value.slice(0, 3)}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent />}
								/>
								<LineGraph
									dataKey="desktop"
									type="monotone"
									stroke="var(--color-desktop)"
									strokeWidth={2}
									dot={false}
								/>
								<LineGraph
									dataKey="mobile"
									type="monotone"
									stroke="var(--color-mobile)"
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ChartContainer>
					</CardContent>
					<CardFooter>
						<div className="text-sm">
							Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
						</div>
					</CardFooter>
				</Card>

				{/* New Followers */}
				<Card>
					<CardHeader>
						<CardTitle>New Followers</CardTitle>
						<CardDescription>January - June 2024</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							className="mx-auto max-h-[250px]"
							config={newFollowersConfig} // Pass the config here
						>
							<PieChart>
								<Pie
									data={newFollowersData}
									dataKey="visitors"
									innerRadius={60}
									nameKey="browser"
									strokeWidth={5}
								>
									<LabelList position="center" />
								</Pie>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
							</PieChart>
						</ChartContainer>
					</CardContent>
					<CardFooter className="text-sm">
						Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
					</CardFooter>
				</Card>

				{/* Engagement Rate */}
				<Card>
					<CardHeader>
						<CardTitle>Engagement Rate</CardTitle>
						<CardDescription>January - June 2024</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer config={engagementRateConfig}>
							<BarChart data={engagementRateData}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickFormatter={(value) => value.slice(0, 3)}
								/>
								<Bar
									dataKey="desktop"
									fill="var(--color-desktop)"
								>
									<LabelList
										position="top"
										className="fill-foreground"
									/>
								</Bar>
							</BarChart>
						</ChartContainer>
					</CardContent>
					<CardFooter className="text-sm">
						Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
					</CardFooter>
				</Card>
			</div>
		</>
	);
};

export default OverviewCard;
