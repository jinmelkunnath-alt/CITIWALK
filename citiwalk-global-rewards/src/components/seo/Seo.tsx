import { Helmet } from "react-helmet-async";
import { brand } from "@/constants/brand";

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function Seo({
  title,
  description = brand.description,
  path = "/",
  noIndex = false,
}: SeoProps) {
  const pageTitle = title ? brand.titleTemplate.replace("%s", title) : brand.defaultTitle;
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const canonical = `${origin}${path}`;
  const socialImage = `${origin}${brand.socialImage}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={brand.name} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={socialImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={socialImage} />
    </Helmet>
  );
}
