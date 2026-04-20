import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Pièces jointes encodées en data URL (calendrier éditorial) */
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
