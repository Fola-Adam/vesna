"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  { name: "Home", icon: "home", image: "/vesna-imgs/minimal-workdesk.png", href: "/picks?category=home" },
  { name: "Tech", icon: "laptop", image: "/vesna-imgs/coloured-keyboard.png", href: "/picks?category=tech" },
  { name: "Fashion", icon: "checkroom", image: "/vesna-imgs/luxury-brown-duffel.png", href: "/picks?category=fashion" },
  { name: "Finance", icon: "account_balance", image: "/vesna-imgs/luxury-watch-on-book.png", href: "/picks?category=finance" },
];

export default function CategoryGrid() {
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
            Shop by Category
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-square overflow-hidden bg-surface-container hover-lift glow-hover"
            >
              <Image
                src={category.image}
                alt={category.name}
                className="object-cover category-image-zoom"
                fill
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-3xl lg:text-4xl text-primary mb-2">
                  {category.icon}
                </span>
                <h3 className="font-section-header text-sm lg:text-base text-on-background uppercase tracking-[0.15em]">
                  {category.name}
                </h3>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .category-image-zoom {
          transition: transform 1s cubic-bezier(0.25, 0.1, 0.25, 1),
                      opacity 0.8s ease;
          opacity: 0.6;
        }
        .group:hover .category-image-zoom {
          transform: scale(1.08);
          opacity: 0.85;
        }
        .hover-lift {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(149, 212, 179, 0.2);
        }
        .glow-hover {
          transition: box-shadow 0.3s ease;
        }
        .glow-hover:hover {
          box-shadow: 0 0 20px rgba(149, 212, 179, 0.15);
        }
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