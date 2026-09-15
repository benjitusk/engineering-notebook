// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://example.com',
    integrations: [mdx(), sitemap(), react()],

    vite: {
        plugins: [tailwindcss()]
    },

    // Code fences are highlighted with Shiki in both palettes. Prose owns the
    // surface and swaps to the dark token colours under the dark theme.
    markdown: {
        shikiConfig: {
            themes: { light: 'github-light', dark: 'github-dark' },
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
