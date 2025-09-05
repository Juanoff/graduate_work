import type { NextConfig } from "next";
import url from "url";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://graduate-work.onrender.com";

const parsedUrl = new url.URL(apiUrl);
const domain = parsedUrl.hostname;

const nextConfig: NextConfig = {
  images: {
    domains: [domain],
  },
};

export default nextConfig;
