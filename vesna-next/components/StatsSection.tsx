"use client";

import { useEffect, useRef, useState } from "react";

interface StatItemProps {
  end: number;
  suffix?: string;
  decimals?: number;
  label: string;
  isVisible: boolean;
}

function StatItem({ end, suffix = "", decimals = 0, label, isVisible }: StatItemProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * end;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, isVisible]);

  return (
    <div className="text-center">
      <p className="font-display-hero text-3xl lg:text-5xl text-primary mb-2">
        {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}
        {suffix}
      </p>
      <p className="font-button-label text-[10px] lg:text-xs text-on-surface-variant uppercase tracking-[0.2em]">
        {label}
      </p>
    </div>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { end: 47, label: "Curated Objects" },
    { end: 8, label: "Categories" },
    { end: 4.9, decimals: 1, label: "Avg. Rating" },
    { end: 2000, suffix: "+", label: "Newsletter Subs" },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 lg:py-24 px-5 sm:px-8 lg:px-20 bg-surface-container reveal"
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16 lg:mb-20">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              end={stat.end}
              suffix={stat.suffix}
              decimals={stat.decimals || 0}
              label={stat.label}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Trust Logos */}
        <div className="border-t border-outline/20 pt-12 lg:pt-16">
          <p className="font-button-label text-[10px] lg:text-xs text-on-surface-variant uppercase tracking-[0.3em] text-center mb-8 lg:mb-10">
            Featured In
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-50">
            <span className="font-logo text-2xl lg:text-3xl text-on-surface-variant">
              Architectural Digest
            </span>
            <span className="font-logo text-2xl lg:text-3xl text-on-surface-variant">
              Dezeen
            </span>
            <span className="font-logo text-2xl lg:text-3xl text-on-surface-variant">
              Wallpaper*
            </span>
            <span className="font-logo text-2xl lg:text-3xl text-on-surface-variant">
              Monocle
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          will-change: opacity, transform;
          transition: opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),
                      transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
