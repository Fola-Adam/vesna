import Link from "next/link";

export default function Footer() {
  const footerLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/affiliate", label: "Affiliate Disclosure" },
    { href: "/contact", label: "Contact" },
    { href: "/shipping", label: "Shipping & Returns" },
  ];

  return (
    <footer className="border-t border-paper/15 bg-ink px-6 py-12 text-paper sm:px-12 lg:py-16">
      <div className="flex flex-col items-center gap-6 lg:gap-8 max-w-[1440px] mx-auto">
        <Link
          href="/"
          className="font-audiowide text-2xl tracking-[0.3em] text-paper focus-ring lg:text-3xl"
        >
          VESN<span className="inline-block">Λ</span>
        </Link>

        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-button-label text-xs uppercase tracking-wider text-paper/80 transition-colors hover:text-paper focus-ring"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="font-button-label text-[10px] uppercase tracking-widest text-paper/70">
          © 2026 VESNA. ALL RIGHTS RESERVED.
        </div>

        <p className="max-w-2xl text-center text-paper/75 text-xs leading-relaxed">
          Vesna may earn a commission from qualifying purchases made through some product links. This does not change the price you pay.
        </p>
      </div>
    </footer>
  );
}
