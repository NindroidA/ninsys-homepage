const SITE_NAME = "Nindroid Systems";
const BASE_URL = "https://nindroidsystems.com";

interface SeoProps {
  /** Page title, without the site name suffix. */
  title: string;
  /** Meta description for this route. */
  description?: string;
  /** Path for canonical/og:url, e.g. "/projects". Omit for non-canonical pages. */
  path?: string;
  /**
   * Keep this route out of search results. The SPA fallback serves index.html
   * with a 200 for every unknown URL, so without this the 404 page is a soft 404
   * that crawlers will happily index.
   */
  noindex?: boolean;
}

/**
 * Per-route document metadata via React 19's native <title>/<meta> hoisting.
 *
 * The static defaults in index.html cover no-JS crawlers and the homepage; this
 * sets the title/description for JS clients and browser tabs on inner routes.
 * Pair with SSG/prerender (future PR) to deliver per-route metadata to crawlers.
 */
export function Seo({ title, description, path, noindex }: SeoProps) {
  const fullTitle = `${title} · ${SITE_NAME}`;
  const url = path ? `${BASE_URL}${path}` : undefined;

  return (
    <>
      <title>{fullTitle}</title>
      {noindex ? <meta name="robots" content="noindex" /> : null}
      {description ? <meta name="description" content={description} /> : null}
      <meta property="og:title" content={fullTitle} />
      {description ? <meta property="og:description" content={description} /> : null}
      {url ? <meta property="og:url" content={url} /> : null}
      {url ? <link rel="canonical" href={url} /> : null}
      <meta name="twitter:title" content={fullTitle} />
      {description ? <meta name="twitter:description" content={description} /> : null}
    </>
  );
}
