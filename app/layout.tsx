import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "LinkNova Pro | Smart URL Shortener",
  description: "Create professional short links with optional password protection, expiration, and QR generation."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
