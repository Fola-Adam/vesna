"use client";

import { useState, useEffect, useCallback } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [displayText, setDisplayText] = useState("");
  const [showTagline, setShowTagline] = useState(false);
  const [taglineText, setTaglineText] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const mainText = "VESNA";
  const tagline = "◊ The Art of Intentional Living ◊";

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  }, [onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Typewriter effect for main text
    const typeMainText = () => {
      mainText.split("").forEach((char, index) => {
        const timeout = setTimeout(() => {
          setDisplayText((prev) => prev + char);
        }, index * 150);
        timeouts.push(timeout);
      });

      // After main text, blink cursor then show tagline
      const taglineTimeout = setTimeout(() => {
        setShowTagline(true);
      }, mainText.length * 150 + 300);
      timeouts.push(taglineTimeout);
    };

    typeMainText();

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    if (!showTagline) return;

    const timeouts: NodeJS.Timeout[] = [];

    // Typewriter effect for tagline
    tagline.split("").forEach((char, index) => {
      const timeout = setTimeout(() => {
        setTaglineText((prev) => prev + char);
      }, index * 50);
      timeouts.push(timeout);
    });

    // Complete loading
    const completeTimeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, tagline.length * 50 + 400);
    timeouts.push(completeTimeout);

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [showTagline, onComplete]);

  if (!isVisible) {
    return (
      <div
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden transition-opacity duration-500 opacity-0 pointer-events-none"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden">
      {/* Film Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated Border Tracing */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-border-top" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-80 animate-border-bottom" />
        <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-80 animate-border-left" />
        <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-transparent via-secondary to-transparent opacity-80 animate-border-right" />
      </div>

      <div className="text-center relative z-10">
        <h1 className="font-['Audiowide'] text-5xl sm:text-6xl lg:text-7xl text-primary tracking-[0.3em] mb-6">
          <span>{displayText}</span>
          <span className="inline-block w-[3px] h-[1em] bg-primary ml-1 animate-blink">|</span>
        </h1>
        <div className="h-8">
          <p
            className={`font-button-label text-sm text-on-surface-variant tracking-[0.2em] uppercase transition-opacity duration-300 ${
              showTagline ? "opacity-100" : "opacity-0"
            }`}
          >
            {taglineText}
            {showTagline && taglineText.length < tagline.length && (
              <span className="inline-block w-[2px] h-[0.9em] bg-on-surface-variant ml-1">|</span>
            )}
          </p>
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 font-button-label text-xs uppercase tracking-[0.15em] text-on-surface-variant/60 hover:text-on-surface-variant transition-colors focus-ring"
      >
        Skip
      </button>

      <style jsx global>{`
        @keyframes border-top {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes border-bottom {
          0% { transform: translateX(100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes border-left {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes border-right {
          0% { transform: translateY(100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100%); opacity: 0; }
        }
        .animate-border-top {
          animation: border-top 4s ease-in-out infinite;
        }
        .animate-border-bottom {
          animation: border-bottom 4s ease-in-out infinite;
        }
        .animate-border-left {
          animation: border-left 4s ease-in-out infinite;
        }
        .animate-border-right {
          animation: border-right 4s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
}
