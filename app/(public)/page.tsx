import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import PhilosophySection from "@/components/PhilosophySection";
import StatsSection from "@/components/StatsSection";
import ProductSlider from "@/components/ProductSlider";
import CategoryGrid from "@/components/CategoryGrid";
import CuratorSection from "@/components/CuratorSection";
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
  const categoryNames = [...new Set(products.map(p => p.categories?.name).filter((name): name is string => !!name))];
  return (
    <main>
      <ScrollProgress />
      <HeroSection />
      <PhilosophySection />
      <StatsSection objectCount={products.length} categoryCount={categoryNames.length} />
      <ProductSlider products={products} />
      <CategoryGrid categoryNames={categoryNames} />
      <CuratorSection />
      <NewsletterSection />
      <BackToTop />
    </main>
  );
}
