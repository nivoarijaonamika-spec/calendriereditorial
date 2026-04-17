"use client";

import { HeroUIProvider } from "@heroui/system";
import { Toaster } from "react-hot-toast";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeroUIProvider>{children}
  <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      /></HeroUIProvider>;
}