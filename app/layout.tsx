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
    "Interactive finance dashboard UI with summary cards, visual analytics, transactions, role-based controls, and insights."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${manrope.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
