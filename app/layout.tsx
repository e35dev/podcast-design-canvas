import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Podcast Design Canvas",
  description: "Self-serve visual podcast production workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-ink">{children}</body>
    </html>
  );
}
