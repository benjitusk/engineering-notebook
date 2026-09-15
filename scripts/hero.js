// Render post hero figures outside of Astro, with the same renderer the site
// uses (src/lib/hero), to iterate on motifs, seeds, and labels.
//
//   npm run hero                                  every post
//   npm run hero -- notebook-init                 one or more posts, by slug
//   npm run hero -- notebook-init --motif timing  try a different motif
//   npm run hero -- notebook-init --seed 7        reroll
//   npm run hero -- notebook-init --all-motifs    every motif, side by side
//   npm run hero -- --png                         also write PNGs (light theme)
//   npm run hero -- --out some/dir                output directory
//
// Output: one SVG per figure plus index.html, a contact sheet showing each
// figure in the light and dark themes with the site's fonts. Output defaults
// to .hero-preview/ (gitignored). To keep a result, copy its motif and seed
// into the post's `hero` frontmatter.
//
// PNGs are rasterised by sharp, which can't load the bundled Plex fonts, so
// their text falls back to a system monospace; the contact sheet is exact.

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import yaml from 'js-yaml';
import sharp from 'sharp';
import { MOTIFS, renderHero } from '../src/lib/hero/index.js';
import { DARK, LIGHT, TOKENS } from '../src/lib/hero/palette.js';

const CONTENT_DIR = 'src/content/projects';
const FONT_DIR = 'src/assets/og';

/** @param {string} message */
function fail(message) {
    console.error(message);
    process.exit(1);
}

const { values: args, positionals: slugs } = parseArgs({
    allowPositionals: true,
    options: {
        motif: { type: 'string' },
        seed: { type: 'string' },
        'all-motifs': { type: 'boolean', default: false },
        png: { type: 'boolean', default: false },
        out: { type: 'string', default: '.hero-preview' },
        help: { type: 'boolean', short: 'h', default: false },
    },
});

if (args.help) {
    const source = await fs.readFile(new URL(import.meta.url), 'utf8');
    console.log(source.split('\n').filter((line) => line.startsWith('//')).map((line) => line.slice(3)).join('\n'));
    process.exit(0);
}
if (args.motif && !MOTIFS.includes(args.motif)) fail(`Unknown motif "${args.motif}". Use one of: ${MOTIFS.join(', ')}.`);
if (args.motif && args['all-motifs']) fail('Use either --motif or --all-motifs, not both.');

/** Read every post's frontmatter the way the content collection sees it. */
async function loadPosts() {
    const files = (await fs.readdir(CONTENT_DIR)).filter((file) => /\.mdx?$/.test(file)).sort();
    return Promise.all(
        files.map(async (file) => {
            const source = await fs.readFile(path.join(CONTENT_DIR, file), 'utf8');
            const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
            const data = /** @type {Record<string, any>} */ ((match && yaml.load(match[1])) || {});
            return {
                ...data,
                slug: file.replace(/\.mdx?$/, ''),
                title: String(data.title ?? ''),
                pubDate: data.pubDate ? new Date(data.pubDate) : undefined,
            };
        })
    );
}

/** @param {unknown} value */
const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const allPosts = await loadPosts();
const unknown = slugs.filter((slug) => !allPosts.some((post) => post.slug === slug));
if (unknown.length) fail(`No post named ${unknown.join(', ')}. Posts: ${allPosts.map((post) => post.slug).join(', ')}`);
const posts = slugs.length ? allPosts.filter((post) => slugs.includes(post.slug)) : allPosts;

const outDir = path.resolve(args.out);
await fs.mkdir(outDir, { recursive: true });

const figures = [];
for (const post of posts) {
    const motifs = args['all-motifs'] ? MOTIFS : [args.motif];
    for (const motifOption of motifs) {
        const options = { motif: /** @type {any} */ (motifOption), seed: args.seed };
        const { svg, motif, source, seed } = renderHero(post, { ...options, palette: LIGHT });
        const variant = args['all-motifs'] || args.motif ? `--${motif}` : '';
        const name = `${post.slug}${variant}${args.seed ? `--seed-${args.seed}` : ''}`;

        await fs.writeFile(path.join(outDir, `${name}.svg`), svg);
        if (args.png) {
            await sharp(Buffer.from(svg), { density: 192 }).png().toFile(path.join(outDir, `${name}.png`));
        }
        figures.push({ post, name, motif, source, seed, options });
        console.log(`${name.padEnd(40)} ${motif.padEnd(8)} seed ${String(seed).padEnd(28)} (${source})`);
    }
}

// Contact sheet: the same figures rendered with CSS tokens, in both themes.
const fontUrl = (/** @type {string} */ file) => path.relative(outDir, path.resolve(FONT_DIR, file)).split(path.sep).join('/');
const vars = (/** @type {Record<string, string>} */ palette) =>
    Object.entries(TOKENS)
        .map(([key, token]) => `--${token}:${palette[key]};`)
        .join('');
const cards = (/** @type {'light' | 'dark'} */ theme) =>
    figures
        .map(({ post, name, motif, source, seed, options }) => {
            const { svg } = renderHero(post, { ...options, palette: 'css', id: `${name}-${theme}` });
            return `<figure>${svg}<figcaption><b>${esc(name)}</b> · ${motif} · seed ${esc(seed)} · ${esc(source)}</figcaption></figure>`;
        })
        .join('\n');

const html = `<!doctype html>
<meta charset="utf-8">
<title>Hero figures</title>
<style>
@font-face { font-family: 'IBM Plex Mono'; font-weight: 400; src: url('${fontUrl('IBMPlexMono-Regular.woff')}') format('woff'); }
@font-face { font-family: 'IBM Plex Mono'; font-weight: 500 600; src: url('${fontUrl('IBMPlexMono-SemiBold.woff')}') format('woff'); }
body { margin: 0; font: 13px/1.5 'IBM Plex Mono', monospace; }
section { --font-mono: 'IBM Plex Mono', ui-monospace, monospace; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(560px, 100%), 1fr)); gap: 32px; padding: 32px; }
.light { ${vars(LIGHT)} background: ${LIGHT.paper}; color: ${LIGHT.muted}; }
.dark { ${vars(DARK)} background: ${DARK.paper}; color: ${DARK.muted}; }
h2 { grid-column: 1 / -1; margin: 0; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
figure { margin: 0; }
svg { display: block; width: 100%; height: auto; border: 1px solid var(--border); border-radius: 8px; }
figcaption { margin-top: 8px; }
</style>
<section class="light"><h2>Light</h2>
${cards('light')}
</section>
<section class="dark"><h2>Dark</h2>
${cards('dark')}
</section>
`;
const sheetPath = path.join(outDir, 'index.html');
await fs.writeFile(sheetPath, html);
console.log(`\n${figures.length} figure(s). Contact sheet: ${pathToFileURL(sheetPath).href}`);
