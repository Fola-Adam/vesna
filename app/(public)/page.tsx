import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import PhilosophySection from "@/components/PhilosophySection";
import StatsSection from "@/components/StatsSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import ProductSlider from "@/components/ProductSlider";
import CategoryGrid from "@/components/CategoryGrid";
import CuratorSection from "@/components/CuratorSection";
import NewsletterSection from "@/components/NewsletterSection";
import BackToTop from "@/components/BackToTop";
import ScrollProgress from "@/components/ScrollProgress";

export const metadata: Metadata = {
  title: "Vesna — Curated Living by Victory Ebenezer",
  description:
    "A hand-picked collection of objects, tools and experiences with purpose — curated by Victory Ebenezer.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Vesna — Curated Living",
    description: "Curated objects with purpose, selected by Victory Ebenezer.",
    url: "/",
    type: "website",
  },
};

/**
 * Home page — Server Component shell.
 *
 * The old full-screen LoadingScreen gate was removed: it delayed Largest
 * Contentful Paint by ~1.5s for zero information value. Individual sections
 * below still reveal-on-scroll, so the page keeps its motion language
 * without blocking first paint on a spinner.
 */
export default function HomePage() {
  return (
    <main>
      <ScrollProgress />
      <HeroSection />
      <PhilosophySection />
      <StatsSection />
      <TestimonialsCarousel />
      <ProductSlider />
      <CategoryGrid />
      <CuratorSection />
      <NewsletterSection />
      <BackToTop />
    </main>
  );
}
