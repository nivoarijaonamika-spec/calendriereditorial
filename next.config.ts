import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Pièces jointes encodées en data URL (calendrier éditorial) */
      /** ≥ taille fichier max en data URL (base64 ~ +33 %). */
      bodySizeLimit: "24mb",
    },
  },
};

export default nextConfig;
