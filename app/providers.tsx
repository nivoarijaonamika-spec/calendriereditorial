"use client";

import { HeroUIProvider } from "@heroui/system";
import { Toaster } from "react-hot-toast";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeroUIProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#10101a",
            color: "#f0f0ff",
            border: "1px solid rgba(240, 64, 144, 0.25)",
          },
        }}
      />
    </HeroUIProvider>
  );
}