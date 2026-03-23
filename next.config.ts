import type { NextConfig } from "next";

const workwearBaseUrl = process.env.NEXT_PUBLIC_WORKWEAR_BASE_URL || "";

const remotePatterns: Array<{
  protocol: "http" | "https";
  hostname: string;
  pathname: string;
}> = [];

if (workwearBaseUrl) {
  try {
    const parsedBaseUrl = new URL(workwearBaseUrl);

    if (parsedBaseUrl.protocol === "https:" || parsedBaseUrl.protocol === "http:") {
      remotePatterns.push({
        protocol: parsedBaseUrl.protocol.replace(":", "") as "http" | "https",
        hostname: parsedBaseUrl.hostname,
        pathname: "/storage/v1/object/public/**",
      });
    }
  } catch {
    // Ignore invalid URL and keep remotePatterns empty.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;