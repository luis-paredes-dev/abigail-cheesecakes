import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones and other devices on the home Wi-Fi use the dev server
  // (http://192.168.1.31:3000). Development only; no effect on the live site.
  // If the computer's local IP address changes, update it here.
  allowedDevOrigins: ["192.168.1.31"],
};

export default nextConfig;
