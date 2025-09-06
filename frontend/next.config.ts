import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "graduate-work.onrender.com",
				port: "",
				pathname: "/uploads/avatars/**",
			},
		],
	},
};

export default nextConfig;
