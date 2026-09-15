// @ts-check

import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import satteriCallouts from 'satteri-callouts';
import { satteriEmoji } from 'satteri-emoji';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://example.com',
    integrations: [mdx(), sitemap(), react()],

    vite: {
        plugins: [tailwindcss()],
    },

    // Code fences are highlighted with Shiki in both palettes. Prose owns the
    // surface and swaps to the dark token colours under the dark theme.
    markdown: {
        shikiConfig: {
            themes: { light: 'github-light', dark: 'github-dark' },
            wrap: false,
        },
        processor: satteri({
            hastPlugins: [
                satteriCallouts({
                    theme: 'obsidian',
                    callouts: {
                        // Lucide "test-tube" — examples are specimens.
                        example: {
                            title: 'Example',
                            indicator:
                                '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2"></path><path d="M8.5 2h7"></path><path d="M14.5 16h-5"></path></svg>',
                        },
                        // `> [!console] Title` — captured terminal output; styled in Prose.
                        console: {
                            title: 'Console',
                            // Lucide "terminal", matching the obsidian theme's icon set.
                            indicator:
                                '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
                        },
                    },
                }),
            ],
            mdastPlugins: [satteriEmoji({ shortcodes: ['github', 'cldr'] })],
        }),
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
