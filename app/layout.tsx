import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vesna - Curated Living by Victory Ebenezer",
  description: "A curated collection of exceptional products across tech, audio, lifestyle, workspace, and travel. Each item personally selected by Victory Ebenezer.",
  keywords: ["curated", "lifestyle", "products", "Victory Ebenezer", "Vesna"],
  authors: [{ name: "Victory Ebenezer" }],
  openGraph: {
    title: "Vesna - Curated Living",
    description: "Objects with purpose. Stories worth telling.",
    type: "website",
    locale: "en_US",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vesna",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10382d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${manrope.variable} ${cormorant.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
