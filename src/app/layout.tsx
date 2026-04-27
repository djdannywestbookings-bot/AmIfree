import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "./_components/PWARegister";

export const metadata: Metadata = {
  title: "AmIFree",
  description:
    "Scheduling app for service providers who take bookings — paste a text message, get a calendar entry, sync to Google/Apple/Outlook.",
  manifest: "/manifest.webmanifest",
  applicationName: "AmIFree",
  // iOS Safari treats apple-touch-icon specially; use the same icon
  // until we ship rasterized PNG variants.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", sizes: "any" }],
  },
  appleWebApp: {
    capable: true,
    // "black-translucent" lets the app pull under the iOS status bar
    // for a more native feel when launched from the home screen.
    statusBarStyle: "black-translucent",
    title: "AmIFree",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  // Allow zoom for accessibility — we're not building a game.
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
