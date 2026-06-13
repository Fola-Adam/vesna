import type { Metadata } from "next";
import { Tenor_Sans, Audiowide, Spectral, Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";

const tenorSans = Tenor_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-button-label",
  display: "swap",
});

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-audiowide",
  display: "swap",
});

const spectral = Spectral({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-spectral",
  display: "swap",
});

const cinzel = Cinzel({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-playfair",
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
  themeColor: "#131312",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${tenorSans.variable} ${audiowide.variable} ${spectral.variable} ${cinzel.variable} ${playfairDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
