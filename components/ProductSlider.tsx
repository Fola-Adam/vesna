"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  quote: string;
  detail: string;
  image: string;
  badge?: "featured" | "new";
}

const products: Product[] = [
  {
    id: 1,
    name: "The Tactile Engine",
    quote: '"The rhythmic click is my metronome for focus."',
    detail: "Heavy brass weight, zero drift",
    image: "/vesna-imgs/coloured-keyboard.png",
    badge: "featured",
  },
  {
    id: 2,
    name: "Heritage Ledger",
    quote: '"Ink on grain is a commitment."',
    detail: "Hand-dyed Tuscan leather",
    image: "/vesna-imgs/vintage-brown-leather.png",
    badge: "new",
  },
  {
    id: 3,
    name: "Empty Form 01",
    quote: '"A vessel for light and shadow."',
    detail: "Hand-thrown in Kyoto",
    image: "/vesna-imgs/native-cinematic-vase.png",
  },
  {
    id: 4,
    name: "Architect Lamp",
    quote: "",
    detail: "Solid brass, adjustable arm",
    image: "/vesna-imgs/golden-desklamp.png",
  },
  {
    id: 5,
    name: "Porcelain Mug",
    quote: "",
    detail: "Handcrafted, speckled glaze",
    image: "/vesna-imgs/coffee-maker-1.png",
    badge: "featured",
  },
  {
    id: 6,
    name: "Oak Serving Tray",
    quote: "",
    detail: "Natural finish, brass handles",
    image: "/vesna-imgs/minimal-workdesk.png",
  },
  {
    id: 7,
    name: "The Script Master",
    quote: "",
    detail: "18k gold nib, ebonite feed",
    image: "/vesna-imgs/premium-fountain-pen.png",
    badge: "new",
  },
  {
    id: 8,
    name: "Chronograph No. 7",
    quote: "",
    detail: "Swiss movement, sapphire crystal",
    image: "/vesna-imgs/luxury-watch-on-book.png",
  },
];

export default function ProductSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(33.33);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            const items = entry.target.querySelectorAll(".stagger-reveal");
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add("active");
              }, index * 100);
            });
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

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
    setScrollProgress(Math.max(33.33, progress));
  };

  const scrollTo = (direction: "prev" | "next") => {
    if (!sliderRef.current) return;
    const scrollAmount = 300;
    sliderRef.current.scrollBy({
      left: direction === "prev" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 bg-surface-container-lowest reveal"
    >
      <div className="flex justify-between items-end mb-10 lg:mb-16">
        <div>
          <h2 className="font-section-header text-xs lg:text-sm text-secondary uppercase mb-2 lg:mb-4 tracking-[0.2em]">
            Curated Spotlight
          </h2>
          <p className="font-display-hero text-2xl sm:text-3xl lg:text-4xl text-on-background">
            Featured Monoliths
          </p>
        </div>
        <div className="flex gap-2 lg:gap-4">
          <button
            onClick={() => scrollTo("prev")}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center border border-outline/30 text-on-background hover:bg-primary hover:text-on-primary transition-all focus-ring"
            aria-label="Previous products"
          >
            <span className="material-symbols-outlined text-lg lg:text-xl">
              chevron_left
            </span>
          </button>
          <button
            onClick={() => scrollTo("next")}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center border border-outline/30 text-on-background hover:bg-primary hover:text-on-primary transition-all focus-ring"
            aria-label="Next products"
          >
            <span className="material-symbols-outlined text-lg lg:text-xl">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="slider-container flex gap-4 lg:gap-8 overflow-x-auto no-scrollbar pb-8"
        >
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/picks/${product.id}`}
              className={`slider-item min-w-[200px] sm:min-w-[240px] lg:min-w-[280px] group cursor-pointer stagger-reveal stagger-${Math.min(
                index + 1,
                3
              )}`}
            >
              <div className="h-40 sm:h-48 lg:h-56 overflow-hidden bg-neutral-900 mb-3 lg:mb-5 relative">
                {product.badge && (
                  <span
                    className={`badge ${
                      product.badge === "featured"
                        ? "badge-featured"
                        : "badge-new"
                    }`}
                  >
                    {product.badge === "featured" ? "Featured" : "New"}
                  </span>
                )}
                <Image
                  alt={product.name}
                  className="object-cover product-image-zoom"
                  src={product.image}
                  fill
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 font-button-label text-[10px] tracking-[0.3em] text-white border border-white/50 px-4 lg:px-6 py-2 lg:py-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 uppercase">
                    Explore
                  </span>
                </div>
              </div>
              <h3 className="font-section-header text-base lg:text-lg text-on-background mb-2">
                {product.name}
              </h3>
              {product.quote && (
                <div className="mb-3 lg:mb-4 space-y-1 lg:space-y-2">
                  <p className="font-body-main text-xs lg:text-sm text-on-surface-variant italic">
                    {product.quote}
                  </p>
                  <p className="text-[10px] font-button-label text-secondary uppercase tracking-widest opacity-80">
                    {product.detail}
                  </p>
                </div>
              )}
              {!product.quote && (
                <div className="text-center">
                  <p className="font-body text-xs lg:text-sm text-outline mb-3">
                    {product.detail}
                  </p>
                </div>
              )}
              <div className="h-[1px] w-12 bg-secondary transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Slider Progress Bar */}
        <div
          className="slider-progress"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Pagination */}
        <div className="flex justify-center gap-2 lg:gap-3 mt-4 lg:mt-8">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-6 lg:w-8 h-[2px] transition-all ${
                scrollProgress >= (index + 1) * 33.33
                  ? "bg-primary"
                  : "bg-outline/30"
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .slider-container {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .slider-item {
          flex-shrink: 0;
        }
        .product-image-zoom {
          transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .group:hover .product-image-zoom {
          transform: scale(1.05);
        }
        .badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          font-family: "Tenor Sans", sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: 9999px;
          z-index: 10;
        }
        .badge-featured {
          background: rgba(149, 212, 179, 0.9);
          color: #003824;
        }
        .badge-new {
          background: rgba(230, 195, 100, 0.9);
          color: #3d2e00;
        }
        .slider-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #e6c364, #95d4b3);
          transition: width 0.3s ease;
          z-index: 20;
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
        .stagger-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .stagger-reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        .stagger-1 { transition-delay: 0ms; }
        .stagger-2 { transition-delay: 100ms; }
        .stagger-3 { transition-delay: 200ms; }
      `}</style>
    </section>
  );
}