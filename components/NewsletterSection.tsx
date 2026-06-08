"use client";

import { useState, useEffect, useRef } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [showError, setShowError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setIsSubmitted(true);
    // TODO: Integrate with Brevo API
    console.log("Newsletter signup:", email);
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-32 bg-neutral-950 border-y border-neutral-900 relative overflow-hidden reveal"
    >
      {/* Pinstripe pattern background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h1v40H0V0zm10 0h1v40h-1V0zm10 0h1v40h-1V0zm10 0h1v40h-1V0zm10 0h1v40h-1V0z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
        <h2 className="font-section-header text-xs lg:text-sm text-secondary uppercase mb-4 lg:mb-6 tracking-[0.3em]">
          Digital Ephemera
        </h2>
        <h3 className="font-display-hero text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-on-background mb-6 lg:mb-8">
          The Weekly Dispatch
        </h3>
        <p className="font-body-main text-base lg:text-lg text-on-surface-variant mb-6 lg:mb-8 max-w-2xl mx-auto leading-relaxed">
          A limited-entry journal on design, solitude, and the tools of the
          trade. Delivered every Sunday.
        </p>

        {/* Value Props */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mb-8 lg:mb-10">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-lg">
              check_circle
            </span>
            <span className="font-body-main text-xs lg:text-sm">
              Curated picks weekly
            </span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-lg">
              check_circle
            </span>
            <span className="font-body-main text-xs lg:text-sm">
              No spam, ever
            </span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-lg">
              check_circle
            </span>
            <span className="font-body-main text-xs lg:text-sm">
              Unsubscribe anytime
            </span>
          </div>
        </div>

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 lg:gap-6 max-w-xl mx-auto items-center"
          >
            <div className="w-full relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setShowError(false);
                }}
                placeholder="Your private email address"
                className="w-full bg-transparent border-b border-neutral-800 focus:border-primary focus:ring-0 text-on-surface font-body-main py-3 lg:py-4 transition-all outline-none placeholder-neutral-600 text-sm lg:text-base"
                required
              />
              <div
                className={`absolute -bottom-6 left-0 text-red-500 text-xs font-body-main ${
                  showError ? "visible" : "hidden"
                }`}
              >
                Please enter a valid email address
              </div>
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary transition-all duration-700 group-focus-within:w-full" />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto sm:min-w-max flex-shrink-0 bg-primary text-on-primary font-button-label text-[10px] lg:text-xs px-6 lg:px-10 py-4 lg:py-5 uppercase tracking-[0.12em] hover:bg-white hover:text-black transition-all shadow-xl btn-shimmer gold-glow"
            >
              Join the Dispatch
            </button>
          </form>
        ) : (
          <div className="mt-6 lg:mt-8">
            <p className="font-body-main text-base lg:text-lg text-primary">
              <span className="material-symbols-outlined inline-block mr-2">
                check_circle
              </span>
              You&apos;re in. Welcome to the Dispatch.
            </p>
          </div>
        )}

        <p className="mt-6 lg:mt-8 font-body-main italic text-[10px] lg:text-xs text-neutral-600 tracking-widest uppercase">
          Privacy is the ultimate luxury. Join 2,000+ discerning readers.
        </p>
      </div>

      <style jsx global>{`
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .btn-shimmer:hover::after {
          left: 100%;
        }
        .gold-glow:hover {
          box-shadow: 0 0 30px rgba(230, 195, 100, 0.3);
        }
      `}</style>
    </section>
  );
}
