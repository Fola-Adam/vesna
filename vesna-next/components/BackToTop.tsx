"use client";

import { useState, useEffect } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 lg:bottom-8 right-6 lg:right-8 w-10 lg:w-12 h-10 lg:h-12 bg-primary text-on-primary rounded-full flex items-center justify-center transition-all duration-300 hover:bg-primary/80 focus-ring z-50 ${
        isVisible
          ? "opacity-100 visible"
          : "opacity-0 invisible pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <span className="material-symbols-outlined text-base lg:text-lg">
        arrow_upward
      </span>
    </button>
  );
}
