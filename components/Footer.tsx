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
    <footer className="bg-[#0a0a0a] border-t border-[#242424] px-6 sm:px-12 py-12 lg:py-16">
      <div className="flex flex-col items-center gap-6 lg:gap-8 max-w-[1440px] mx-auto">
        <Link
          href="/"
          className="font-audiowide text-2xl lg:text-3xl text-on-background tracking-[0.3em]"
        >
          VESN<span className="inline-block">Λ</span>
        </Link>

        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-button-label uppercase text-[10px] tracking-widest text-[#666666] hover:text-[#f0ebe0] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="text-primary font-button-label text-[10px] tracking-widest uppercase">
          © 2026 VESNA. ALL RIGHTS RESERVED.
        </div>

        <div className="font-button-label text-[9px] tracking-widest text-[#666666]/50 uppercase">
          Oracle:Atlas
        </div>

        <p className="max-w-2xl text-center text-[#666666] text-[9px] tracking-widest leading-relaxed uppercase">
          Vesna is a curated platform. We may earn a commission from products
          purchased through our links, supporting our editorial independence and
          high-standard curation.
        </p>
      </div>
    </footer>
  );
}
