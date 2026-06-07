"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/picks", label: "Picks" },
    { href: "/journal", label: "Journal" },
    { href: "/about", label: "About" },
    { href: "/archive", label: "Archive" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#242424]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="font-['Audiowide'] text-xl lg:text-2xl text-on-background tracking-[0.3em] hover:text-primary transition-colors logo-pulse"
          >
            VESN<span className="inline-block">Λ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link font-button-label text-xs uppercase tracking-[0.15em] text-on-surface-variant hover:text-on-background transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-on-surface-variant hover:text-on-background transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-[#0a0a0a]/98 backdrop-blur-md border-b border-[#242424] transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="px-6 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-button-label text-sm uppercase tracking-[0.15em] text-on-surface-variant hover:text-on-background transition-colors py-2"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes logoPulse {
          0%, 100% { text-shadow: 0 0 0 rgba(230, 195, 100, 0); }
          50% { text-shadow: 0 0 20px rgba(230, 195, 100, 0.4); }
        }
        .logo-pulse:hover {
          animation: logoPulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
}
