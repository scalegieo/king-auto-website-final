const SITE_URL = "https://www.mykingautoinc.com";

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "@id": `${SITE_URL}/#dealership`,
  name: "King Auto Inc.",
  alternateName: ["King Auto", "My King Auto Inc"],
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  image: `${SITE_URL}/brand/og.png`,
  description:
    "Premium used car dealership on Havana Street in Aurora, Colorado, serving the Denver metro area with transparent pricing and fast financing.",
  telephone: "+1-303-502-3022",
  email: "mykingauto@gmail.com",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2180 S Havana St",
    addressLocality: "Aurora",
    addressRegion: "CO",
    postalCode: "80014",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 39.6683,
    longitude: -104.8657,
  },
  areaServed: [
    { "@type": "City", name: "Denver" },
    { "@type": "City", name: "Aurora" },
    { "@type": "AdministrativeArea", name: "Denver Metro" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "18:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/",
    "https://www.facebook.com/",
    "https://www.youtube.com/",
  ],
};

const webSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "King Auto Inc.",
  description:
    "Used cars Denver & Aurora — live inventory, financing, and Havana St dealership.",
  publisher: { "@id": `${SITE_URL}/#dealership` },
  inLanguage: "en-US",
};

const webPage = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: "King Auto Inc. | Used Cars Denver & Aurora",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#dealership` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${SITE_URL}/brand/og.png`,
  },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", "[data-geo-summary]"],
  },
};

export function JsonLd() {
  const graph = [localBusiness, webSite, webPage];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
