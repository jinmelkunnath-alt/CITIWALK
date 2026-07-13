import { Helmet } from "react-helmet-async";
import { brand } from "@/constants/brand";

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  structuredData?: StructuredData;
};

const organizationSchema = {
  "@type": "Organization",
  "@id": `${brand.siteUrl}/#organization`,
  name: "CITIWALK",
  url: brand.siteUrl,
  logo: `${brand.siteUrl}/pwa-512x512.png`,
};

const websiteSchema = {
  "@type": "WebSite",
  "@id": `${brand.siteUrl}/#website`,
  url: brand.siteUrl,
  name: brand.name,
  description: brand.description,
  publisher: { "@id": `${brand.siteUrl}/#organization` },
  inLanguage: "en",
};

const campaignEventSchema = {
  "@type": "Event",
  "@id": `${brand.siteUrl}/#winner-announcement`,
  name: "CITIWALK Global Rewards Winner Announcement",
  description: brand.description,
  startDate: "2026-08-10T16:00:00+05:30",
  endDate: "2026-08-10T17:00:00+05:30",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  image: [`${brand.siteUrl}${brand.socialImage}`],
  organizer: { "@id": `${brand.siteUrl}/#organization` },
  location: {
    "@type": "VirtualLocation",
    url: brand.siteUrl,
  },
};

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function Seo({
  title,
  description = brand.description,
  path = "/",
  noIndex = false,
  structuredData,
}: SeoProps) {
  const pageTitle = title
    ? brand.titleTemplate.replace("%s", title)
    : brand.defaultTitle;
  const configuredOrigin = brand.siteUrl.replace(/\/$/, "");
  const runtimeOrigin =
    typeof window === "undefined" ? configuredOrigin : window.location.origin;
  const origin = configuredOrigin.includes("YOURDOMAIN.COM")
    ? runtimeOrigin
    : configuredOrigin;
  const canonical = `${origin}${path}`;
  const socialImage = `${origin}${brand.socialImage}`;
  const graph: Record<string, unknown>[] = [organizationSchema, websiteSchema];
  if (path === "/") graph.push(campaignEventSchema);
  if (structuredData) {
    graph.push(...(Array.isArray(structuredData) ? structuredData : [structuredData]));
  }

  return (
    <Helmet>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noIndex ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large"}
      />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content={brand.name} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:secure_url" content={socialImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="CITIWALK Global Rewards" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={socialImage} />
      <meta name="twitter:image:alt" content="CITIWALK Global Rewards" />

      {!noIndex && (
        <script type="application/ld+json">
          {safeJsonLd({ "@context": "https://schema.org", "@graph": graph })}
        </script>
      )}
    </Helmet>
  );
}
