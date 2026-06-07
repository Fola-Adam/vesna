import type { Metadata } from "next";
import { DM_Serif_Display, Spectral, Playfair_Display, Tangerine, Tenor_Sans, Cinzel, Audiowide, Exo_2 } from "next/font/google";
import "./globals.css";
import VenusChatWidget from "@/components/VenusChatWidget";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-hero",
  display: "swap",
});

const spectral = Spectral({
  weight: ["200", "300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body-main",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-accent-italic",
  style: ["normal", "italic"],
  display: "swap",
});

const tangerine = Tangerine({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-logo",
  display: "swap",
});

const tenorSans = Tenor_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-button-label",
  display: "swap",
});

const cinzel = Cinzel({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-section-header",
  display: "swap",
});

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-audiowide",
  display: "swap",
});

const exo2 = Exo_2({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-exo2",
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
  themeColor: "#131312",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vesna",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSerifDisplay.variable} ${spectral.variable} ${playfairDisplay.variable} ${tangerine.variable} ${tenorSans.variable} ${cinzel.variable} ${audiowide.variable} ${exo2.variable} antialiased`}
      >
        {children}
        <VenusChatWidget />
      </body>
    </html>
  );
}
