import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "puppeteer"],
}

export default nextConfig
