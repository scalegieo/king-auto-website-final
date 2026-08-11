import { BrandLogo } from "@/components/BrandLogo";
import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { SVGProps } from "react";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.09 15.84 2 14.61 2 11.93 2 10 3.66 10 6.7v2.8H7v4h3V22h4z" />
    </svg>
  );
}

function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
  );
}

const FOOTER_LINKS = [
  { href: "#inventory", label: "Inventory" },
  { href: "#financing", label: "Financing" },
  { href: "#about", label: "About Us" },
  { href: "#visit", label: "Visit Us" },
  { href: "#contact", label: "Contact" },
  { href: "#privacy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-white/10 bg-black section-pad pt-14 pb-8"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        <div>
          <BrandLogo size="lg" className="mb-4 max-w-[200px]" />
          <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
            Premium used vehicles on Havana Street. Inventory synced from your
            Dealr export feed.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-king-gold mb-4">
            Explore
          </p>
          <ul className="space-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-neutral-300 hover:text-king-red transition-colors text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-king-gold mb-4">
            Visit & call
          </p>
          <ul className="space-y-3 text-sm text-neutral-300">
            <li className="flex gap-2">
              <MapPin className="w-4 h-4 text-king-red shrink-0 mt-0.5" />
              <a
                href="https://maps.google.com/?q=2180+S+Havana+St+Aurora+CO+80014"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                2180 S Havana St
                <br />
                Aurora, CO 80014
              </a>
            </li>
            <li className="flex gap-2 items-center">
              <Phone className="w-4 h-4 text-king-red shrink-0" />
              <a href="tel:3035023022" className="hover:text-white">
                (303) 502-3022
              </a>
            </li>
            <li className="flex gap-2 items-center">
              <Mail className="w-4 h-4 text-king-red shrink-0" />
              <a href="mailto:mykingauto@gmail.com" className="hover:text-white">
                mykingauto@gmail.com
              </a>
            </li>
          </ul>

          <div className="flex gap-3 mt-5">
            {[
              { Icon: InstagramIcon, label: "Instagram", href: "#" },
              { Icon: FacebookIcon, label: "Facebook", href: "#" },
              { Icon: YoutubeIcon, label: "YouTube", href: "#" },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-neutral-300 hover:border-king-gold hover:text-king-gold transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        id="privacy"
        className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-neutral-500"
      >
        <p>© {new Date().getFullYear()} King Auto Inc. All rights reserved.</p>
        <p>Used Cars Denver · Havana St Auto Sales</p>
      </div>
    </footer>
  );
}
