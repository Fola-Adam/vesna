"use client";

import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
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

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}
      <ScrollProgress />
      <main className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}>
        <HeroSection />
        <PhilosophySection />
        <StatsSection />
        <TestimonialsCarousel />
        <ProductSlider />
        <CategoryGrid />
        <CuratorSection />
        <NewsletterSection />
      </main>
      <BackToTop />
    </>
  );
}