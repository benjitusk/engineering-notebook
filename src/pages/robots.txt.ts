import type { APIRoute } from 'astro';

// Everything may be crawled; this just tells crawlers where the sitemap is. Drafts aren't
// built for production, so there's nothing to hide.
export const GET: APIRoute = ({ site }) =>
    new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
