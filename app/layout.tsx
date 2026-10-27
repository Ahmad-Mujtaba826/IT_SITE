import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axiora Technologies | Software, Cloud and AI",
  description: "A Lahore based engineering team building web platforms, cloud systems and AI products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
