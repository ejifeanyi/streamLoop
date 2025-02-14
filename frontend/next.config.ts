/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ["lh3.googleusercontent.com"],
	},
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:5000/:path*",
			},
			{
				source: "/ws",
				destination: "http://localhost:5000/ws",
				has: [
					{
						type: "header",
						key: "upgrade",
						value: "websocket",
					},
				],
			},
		];
	},
	reactStrictMode: true,
	webpack: (config, { isServer }) => {
		return config;
	},
};

module.exports = nextConfig;
