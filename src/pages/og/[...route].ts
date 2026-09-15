import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';

/**
 * Open Graph cards: one 1200×630 PNG per page, rendered at build time.
 *
 * Keys mirror page paths — `/` → `/og/index.png`, `/about/` → `/og/about.png`,
 * `/projects/fingerprint-reader/` → `/og/projects/fingerprint-reader.png`.
 * BaseHead derives the same key from the page URL, so a new page only needs an
 * entry here (project posts are picked up from the collection automatically).
 */
type Card = { title: string; description: string };

const staticPages: Record<string, Card> = {
    index: { title: SITE_TITLE, description: SITE_DESCRIPTION },
    about: { title: 'About', description: 'About Benji Tusk and this engineering notebook.' },
    projects: { title: 'Projects', description: 'Projects, experiments, and investigations from the notebook.' },
    '404': { title: 'Page not found', description: SITE_DESCRIPTION },
};

const projects = await getCollection('projects');
const projectPages = Object.fromEntries(
    projects.map((entry): [string, Card] => [
        `projects/${entry.id}`,
        { title: entry.data.title, description: entry.data.description },
    ])
);

// Palette from src/styles/tokens.css (light theme): --text, --text-muted.
const INK: [number, number, number] = [24, 26, 27];
const MUTED: [number, number, number] = [104, 109, 112];

export const { getStaticPaths, GET } = await OGImageRoute({
    pages: { ...staticPages, ...projectPages },
    getImageOptions: (_path, page: Card) => ({
        title: page.title,
        description: page.description,
        // Graph paper, accent rule, and footer (scripts/og-background.mjs).
        bgImage: { path: './src/assets/og/background.png', fit: 'cover' },
        padding: 80,
        fonts: ['./src/assets/og/IBMPlexSans-Bold.woff', './src/assets/og/IBMPlexSans-Regular.woff'],
        font: {
            title: { families: ['IBM Plex Sans'], weight: 'Bold', size: 68, lineHeight: 1.1, color: INK },
            description: { families: ['IBM Plex Sans'], weight: 'Normal', size: 34, lineHeight: 1.4, color: MUTED },
        },
        // Inside node_modules/.astro so the CI build cache keeps rendered cards.
        cacheDir: './node_modules/.astro/og-canvas',
    }),
});
