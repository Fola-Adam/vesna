"use client";

import { useEffect, useRef } from "react";

interface UseRevealOnScrollOptions {
  threshold?: number;
  rootMargin?: string;
  onReveal?: (entry: IntersectionObserverEntry) => void;
}

export function useRevealOnScroll(options: UseRevealOnScrollOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", onReveal } = options;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            onReveal?.(entry);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, onReveal]);

  return ref;
}