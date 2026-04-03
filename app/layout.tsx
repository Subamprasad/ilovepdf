import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "MoneyFlow Finance Dashboard",
  description:
    "Interactive finance dashboard UI with summary cards, visual analytics, transactions, role-based controls, and insights.",
  verification: {
    google: "2rPmmRIo2EOJg71GgMWSRj-1qwM0duI4FmX86uxpGQc"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8117593741940163"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${sora.variable} ${manrope.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
