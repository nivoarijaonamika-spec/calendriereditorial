import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-[#0d0d14] text-[#f0f0ff] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}