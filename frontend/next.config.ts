import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ["lh3.googleusercontent.com"],
	},
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:5000/api/:path*",
			},
		];
	},
};

export default nextConfig;
