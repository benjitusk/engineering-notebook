// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://example.com',
    integrations: [mdx(), sitemap(), react()],

    // Code fences are highlighted with Shiki; a light theme reads as an
    // intentional capture on the paper background (Prose owns the surface).
    markdown: {
        shikiConfig: {
            theme: 'github-light',
            wrap: false,
        },
    },

    // Self-hosted via Astro's font pipeline (fetched at build, served locally).
    fonts: [
        {
            provider: fontProviders.google(),
            name: 'IBM Plex Sans',
            cssVariable: '--font-plex-sans',
            weights: [400, 500, 600, 700],
            styles: ['normal'],
            subsets: ['latin'],
            fallbacks: ['system-ui', 'sans-serif'],
        },
        {
            provider: fontProviders.google(),
            name: 'IBM Plex Mono',
            cssVariable: '--font-plex-mono',
            weights: [400, 500, 600],
            styles: ['normal'],
            subsets: ['latin'],
            fallbacks: ['ui-monospace', 'monospace'],
        },
    ],
});
