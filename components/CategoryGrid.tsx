"use client";

import Icon from "@/components/Icon";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  { name: "Home", icon: "home", image: "/vesna-imgs/minimal-workdesk.webp", href: "/picks" },
  { name: "Tech", icon: "laptop", image: "/vesna-imgs/coloured-keyboard.webp", href: "/picks" },
  { name: "Fashion", icon: "checkroom", image: "/vesna-imgs/luxury-brown-duffel.webp", href: "/picks" },
  { name: "Finance", icon: "account_balance", image: "/vesna-imgs/luxury-watch-on-book.webp", href: "/picks" },
];

export default function CategoryGrid({ categoryNames }: { categoryNames: string[] }) {
  const catalogCategories = categoryNames.map(name => {
    const template = categories.find(category => category.name.toLowerCase() === name.toLowerCase());
    return { name, icon: template?.icon ?? "star", image: template?.image ?? "/vesna-imgs/minimal-workdesk.webp", href: `/picks?category=${encodeURIComponent(name.trim().toLowerCase())}` };
  });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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

  if (!catalogCategories.length) return null;

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 bg-background border-y border-surface-container reveal"
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-section-header text-xs lg:text-sm text-secondary uppercase mb-4 tracking-[0.2em]">
            Explore Collections
          </h2>
          <p className="font-display-hero text-2xl sm:text-3xl lg:text-4xl text-on-background">
            Browse by Category
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {catalogCategories.map((category) => (
            <Link
              key={category.name.charAt(0).toUpperCase() + category.name.slice(1)}
              href={category.href}
              className="group relative aspect-square overflow-hidden bg-surface-container hover-lift glow-hover"
            >
              <Image
                src={category.image}
                alt={category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                className="object-cover category-image-zoom"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Icon name={category.icon} className="text-3xl lg:text-4xl text-primary mb-2" />
                <h3 className="font-section-header text-sm lg:text-base text-on-background uppercase tracking-[0.15em]">
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </h3>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .category-image-zoom {
          transition: transform 280ms var(--motion-ease),
                      opacity 220ms var(--motion-ease);
          opacity: 0.6;
        }
        .group:hover .category-image-zoom {
          transform: scale(1.035);
          opacity: 0.78;
        }
        .hover-lift {
          transition: transform 200ms var(--motion-ease),
                      box-shadow 200ms var(--motion-ease);
        }
        .hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(23, 22, 19, 0.18);
        }
        .glow-hover {
          transition: box-shadow 200ms var(--motion-ease);
        }
        .glow-hover:hover {
          box-shadow: 0 8px 24px rgba(23, 22, 19, 0.16);
        }
      `}</style>
    </section>
  );
}
