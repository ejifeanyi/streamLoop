import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ["lh3.googleusercontent.com"],
	},
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:5000/:path*",
			},
		];
	},
	// experimental: {
	// 	serverActions: true,
	// },
};

export default nextConfig;
