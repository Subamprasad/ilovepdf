import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Smart URL Shortener",
  description: "Free smart URL shortener with QR code, password protection and expiration links.",
  verification: {
    google: "2rPmmRIo2EOJg71GgMWSRj-1qwM0duI4FmX86uxpGQc"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
