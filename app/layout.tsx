import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bebas_Neue, Cinzel, Poppins } from "next/font/google";
import "./globals.css";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/dealership";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/site-metadata";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s | King Auto Inc.",
  },
  description: HOME_DESCRIPTION,
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
    "Get pre-approved Denver",
    "Car payment calculator Aurora",
    "Truck for sale Aurora",
    "SUV Denver metro",
    "2180 S Havana St",
    "Aurora CO 80014",
    "used cars 80014",
    "shopkingauto",
    "mykingautoinc",
    "King Auto Google reviews",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
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
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
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
    "geo.position": "39.6769623;-104.8654679",
    ICBM: "39.6769623, -104.8654679",
  },
};

function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`}
      </Script>
    </>
  );
}

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
        <AnalyticsBeacon />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
