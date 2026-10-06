import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Would You Rather? — Pick your side",
  description: "Vote on two-option dilemmas and discover where everyone stands.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
