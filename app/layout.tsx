import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Cinzel, Poppins } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-welcome",
  display: "swap",
});

const SITE_URL = "https://www.mykingautoinc.com";
const TITLE =
  "King Auto Inc. | Used Cars Denver & Aurora · Havana St Dealership";
const DESCRIPTION =
  "King Auto Inc. sells premium used cars, trucks, and SUVs on Havana Street in Aurora, CO — serving Denver metro drivers. Transparent pricing, fast financing, and live inventory. Visit 2180 S Havana St or call (303) 502-3022.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | King Auto Inc.",
  },
  description: DESCRIPTION,
  applicationName: "King Auto Inc.",
  authors: [{ name: "King Auto Inc.", url: SITE_URL }],
  creator: "King Auto Inc.",
  publisher: "King Auto Inc.",
  category: "automotive",
  keywords: [
    "King Auto Inc",
    "Used Cars Denver",
    "Used Cars Aurora CO",
    "Havana St Auto Sales",
    "Havana Street Dealership",
    "Denver used car dealership",
    "Aurora Colorado cars",
    "Pre-owned vehicles Denver",
    "Car financing Denver",
    "Truck for sale Aurora",
    "SUV Denver metro",
    "2180 S Havana St",
    "mykingautoinc",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "King Auto Inc.",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "King Auto Inc. — Used cars on Havana Street, Aurora / Denver",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/brand/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "US-CO",
    "geo.placename": "Aurora, Colorado",
    "geo.position": "39.6683;-104.8657",
    ICBM: "39.6683, -104.8657",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${poppins.variable} ${bebas.variable} ${cinzel.variable} font-sans antialiased bg-black text-white`}
      >
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
