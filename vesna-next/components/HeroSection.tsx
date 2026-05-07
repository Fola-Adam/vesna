"use client";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-surface-dim">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="hero-mask w-full h-full relative overflow-hidden">
          <img
            alt="Hero 1"
            className="absolute inset-0 w-full h-full object-cover brightness-75 will-change-transform"
            src="/vesna-imgs/20_high_end_editorial_photography.png"
            loading="eager"
            style={{ animation: "fade-hero 10s infinite" }}
          />
          <img
            alt="Hero 2"
            className="absolute inset-0 w-full h-full object-cover brightness-75 will-change-transform"
            src="/vesna-imgs/editorial-luxurious-workspace.png"
            loading="eager"
            style={{ animation: "fade-hero-reverse 10s infinite" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/40 to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 w-full px-5 sm:px-8 lg:px-20 pt-24 lg:pt-0">
        <div className="max-w-3xl">
          <h1 className="font-display-hero text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[72px] text-on-background mb-6 leading-[1.05]">
            The Art of <span className="block">Intentional Living.</span>
          </h1>
          <p className="font-body-main text-base sm:text-lg lg:text-xl text-on-surface-variant mb-10 lg:mb-12 max-w-lg leading-relaxed">
            A curated monograph of objects and insights for the discerning professional.
          </p>
          <a
            href="/picks"
            className="inline-block bg-primary text-on-primary font-button-label text-xs lg:text-sm px-8 lg:px-12 py-4 lg:py-5 uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-black border border-primary shadow-[0_20px_50px_rgba(230,195,100,0.2)] btn-shimmer gold-glow focus-ring"
          >
            Enter the Sanctuary
          </a>
        </div>
      </div>

      {/* Animated Detail Images */}
      <div className="absolute bottom-8 lg:bottom-12 right-4 sm:right-8 lg:right-20 z-30 w-40 sm:w-56 md:w-64 lg:w-72 hidden sm:block">
        <div className="relative h-48 md:h-72 lg:h-96">
          <div className="absolute -inset-2 border border-primary/30" />
          <div className="relative z-10 w-full h-full shadow-2xl brightness-90 overflow-hidden">
            <img
              alt="Detail 1"
              className="absolute inset-0 w-full h-full object-cover"
              src="/vesna-imgs/secondary-overlay-image.png"
              loading="lazy"
              style={{ animation: "cycle-overlay 12s infinite" }}
            />
            <img
              alt="Detail 2"
              className="absolute inset-0 w-full h-full object-cover"
              src="/vesna-imgs/vintage-workdesk-darkgold.png"
              loading="lazy"
              style={{ animation: "cycle-overlay-2 12s infinite" }}
            />
            <img
              alt="Detail 3"
              className="absolute inset-0 w-full h-full object-cover"
              src="/vesna-imgs/minimal-workdesk.png"
              loading="lazy"
              style={{ animation: "cycle-overlay-3 12s infinite" }}
            />
          </div>
          <div className="absolute inset-0 bg-neutral-950/10 z-20" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 lg:bottom-10 left-5 sm:left-8 lg:left-20 animate-bounce opacity-40 z-20">
        <span className="material-symbols-outlined text-on-background text-2xl">
          keyboard_double_arrow_down
        </span>
      </div>

      <style jsx global>{`
        .hero-mask {
          clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
        }
        @media (max-width: 1024px) {
          .hero-mask {
            clip-path: polygon(0 0, 100% 0, 90% 100%, 0% 100%);
          }
        }
        @media (max-width: 768px) {
          .hero-mask {
            clip-path: none;
          }
        }
        @keyframes fade-hero {
          0%, 45% { opacity: 1; }
          50%, 95% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fade-hero-reverse {
          0%, 45% { opacity: 0; }
          50%, 95% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes cycle-overlay {
          0%, 30% { opacity: 1; transform: scale(1); }
          33%, 63% { opacity: 0; transform: scale(1.05); }
          66%, 96% { opacity: 0; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cycle-overlay-2 {
          0%, 30% { opacity: 0; transform: scale(1.05); }
          33%, 63% { opacity: 1; transform: scale(1); }
          66%, 96% { opacity: 0; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.05); }
        }
        @keyframes cycle-overlay-3 {
          0%, 30% { opacity: 0; transform: scale(1.05); }
          33%, 63% { opacity: 0; transform: scale(1.05); }
          66%, 96% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.05); }
        }
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
