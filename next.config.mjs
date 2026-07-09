import { config } from "dotenv";

config({ path: ".env.local", override: true });
if (!process.env.DATABASE_URL) config({ path: ".env", override: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "",
  },
};

export default nextConfig;
