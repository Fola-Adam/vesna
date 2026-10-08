"use client";

import Icon from "@/components/Icon";
import { useState, useEffect, useCallback } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setIsVisible(window.scrollY > 400);
  }, []);

  useEffect(() => {
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 lg:bottom-8 left-6 lg:left-8 w-10 lg:w-12 h-10 lg:h-12 bg-primary text-on-primary rounded-full flex items-center justify-center transition-all duration-300 hover:bg-primary/80 focus-ring z-30 ${
        isVisible
          ? "opacity-100 visible"
          : "opacity-0 invisible pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <Icon name="arrow_upward" className="text-base lg:text-lg" />
    </button>
  );
}