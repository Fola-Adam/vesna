import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import ProductSlider from "@/components/ProductSlider";
import CuratorSection from "@/components/CuratorSection";
import RecentStories from "@/components/RecentStories";
import NewsletterSection from "@/components/NewsletterSection";
import BackToTop from "@/components/BackToTop";
import { getProducts } from "@/lib/data";
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
export const revalidate = 300;

export default async function HomePage() {
  const products = await getProducts();
  return (
    <main>
      <ScrollProgress />
      <HeroSection />
      <ProductSlider products={products} />
      <CuratorSection />
      <RecentStories />
      <NewsletterSection />
      <BackToTop />
    </main>
  );
}
