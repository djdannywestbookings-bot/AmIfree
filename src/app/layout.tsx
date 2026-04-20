import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmIFree",
  description: "DJ-first scheduling and booking platform",
  manifest: "/manifest.webmanifest",
  applicationName: "AmIFree",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AmIFree",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
