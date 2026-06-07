"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Every object in my workspace now tells a story. Vesna helped me find pieces that actually matter.",
    name: "Sample User",
    role: "Beta Tester",
    initials: "SU",
  },
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, nextSlide]);

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
      className="py-20 lg:py-32 bg-surface-container bg-green-wash relative overflow-hidden reveal"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-20">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-section-header text-xs lg:text-sm text-secondary uppercase mb-4 tracking-[0.3em]">
            From Our Community
          </h2>
          <h3 className="font-display-hero text-2xl sm:text-3xl lg:text-4xl text-on-background">
            Words of Appreciation
          </h3>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="max-w-3xl mx-auto text-center">
                    <span className="material-symbols-outlined text-4xl lg:text-5xl text-primary/50 mb-6">
                      format_quote
                    </span>
                    <p className="font-body-main text-lg lg:text-xl text-on-background italic mb-8 leading-relaxed">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-display text-primary">
                          {testimonial.initials}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-display text-on-background">
                          {testimonial.name}
                        </p>
                        <p className="font-body-main text-sm text-outline">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-primary scale-125' : 'bg-outline/30'}`}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => {
              prevSlide();
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-outline/30 text-on-background hover:bg-primary hover:text-on-primary transition-all focus-ring hidden lg:flex"
            aria-label="Previous testimonial"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => {
              nextSlide();
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-outline/30 text-on-background hover:bg-primary hover:text-on-primary transition-all focus-ring hidden lg:flex"
            aria-label="Next testimonial"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .bg-green-wash {
          background: linear-gradient(135deg, rgba(149, 212, 179, 0.03), transparent);
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