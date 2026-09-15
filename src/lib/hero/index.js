// @ts-check
// Hero figures: deterministic, notebook-style SVG drawings for project posts.
//
// A figure is a drafting sheet (graph paper, zone markers, title block) with
// one motif drawn on it. The motif comes from the post's frontmatter or tags,
// and every random choice is seeded (by the slug, unless `hero.seed` is set),
// so a post always gets the same figure until you tweak it.
//
// Used by src/components/PostHero.astro on the site and scripts/hero.js for
// previewing. Plain JavaScript so both can import it without a build step.

import flow from './motifs/flow.js';
import hexdump from './motifs/hexdump.js';
import plot from './motifs/plot.js';
import timing from './motifs/timing.js';
import traces from './motifs/traces.js';
import { resolvePalette } from './palette.js';
import { createRandom, hashString } from './random.js';
import { line, rect, text, truncate } from './svg.js';

export const MOTIFS = /** @type {const} */ (['timing', 'hexdump', 'traces', 'flow', 'plot']);

/** @typedef {typeof MOTIFS[number]} Motif */

/**
 * @typedef {object} HeroSettings
 * @property {Motif} [motif] Force a motif instead of picking one from tags.
 * @property {string | number} [seed] Reroll the figure. Defaults to the slug.
 * @property {string[]} [labels] Text used by labelled motifs (flow, traces). Defaults to tags.
 */

/**
 * @typedef {object} HeroPost
 * @property {string} slug
 * @property {string} title
 * @property {string} [number]
 * @property {Date} [pubDate]
 * @property {string[]} [tags]
 * @property {string} [status]
 * @property {HeroSettings} [hero]
 */

/**
 * @typedef {object} MotifContext
 * @property {import('./random.js').Random} rand
 * @property {{ x: number, y: number, w: number, h: number }} area Drawing area inside the sheet.
 * @property {HeroPost} post
 * @property {string[]} labels Uppercase labels for the motif to use.
 */

/** @type {Record<Motif, (ctx: MotifContext) => string>} */
const RENDERERS = { timing, hexdump, traces, flow, plot };

/** @type {Record<Motif, string>} */
const MOTIF_NAMES = {
    timing: 'TIMING DIAGRAM',
    hexdump: 'HEX DUMP',
    traces: 'BOARD LAYOUT',
    flow: 'BLOCK DIAGRAM',
    plot: 'PLOT',
};

/** Tag keywords (lowercase substrings) that select each motif. First matching tag wins. */
/** @type {Record<Motif, string[]>} */
export const MOTIF_KEYWORDS = {
    timing: ['i²c', 'i2c', 'spi', 'uart', 'serial', 'protocol', 'logic analyzer', 'signal', 'jtag', 'can bus'],
    hexdump: ['reverse engineering', 'usb', 'binary', 'firmware', 'packet', 'hex', 'bluetooth', 'network', 'file format'],
    traces: ['hardware', 'pcb', 'electronics', 'circuit', 'embedded', 'microcontroller', 'soldering'],
    flow: ['software', 'web', 'astro', 'infrastructure', 'tooling', 'devops', 'pipeline', 'architecture'],
    plot: ['experiment', 'benchmark', 'data', 'performance', 'measurement'],
};

const W = 1000;
const H = 500;
const MARGIN = 24;
const AREA = { x: 64, y: 64, w: 872, h: 324 };

const STOP_WORDS = new Set(
    'about after again also because before being build built could does doing dont from have here into just know like make more most only other over place some than that their them then there these they thing things this those through very want were what when where which while with would write your figuring using'.split(' ')
);

/**
 * Pick the motif for a post, and say why.
 * @param {HeroPost} post
 * @param {Motif} [override]
 * @returns {{ motif: Motif, source: string }}
 */
export function chooseMotif(post, override) {
    if (override) return { motif: override, source: 'option' };
    if (post.hero?.motif) return { motif: post.hero.motif, source: 'frontmatter' };
    for (const tag of post.tags ?? []) {
        const lower = tag.toLowerCase();
        for (const motif of MOTIFS) {
            if (MOTIF_KEYWORDS[motif].some((word) => lower.includes(word))) return { motif, source: `tag "${tag}"` };
        }
    }
    return { motif: MOTIFS[hashString(post.slug) % MOTIFS.length], source: 'slug hash' };
}

/** @param {string} title */
function titleWords(title) {
    const words = title.split(/[^\p{L}\p{N}²]+/u).filter((word) => word.length >= 4 && !STOP_WORDS.has(word.toLowerCase()));
    return [...new Set(words)].slice(0, 5);
}

/**
 * Scoped styles. Every colour comes from the palette, so the same markup works
 * with CSS tokens (site) or literal values (rasterising scripts).
 * @param {string} id
 * @param {import('./palette.js').Palette} p
 * @param {boolean} failed
 */
function styles(id, p, failed) {
    const hl = failed ? p.warning : p.accent;
    const wash = failed ? p.warningWash : p.accentWash;
    // Longhand font properties (no `font:` shorthand) so resvg, which renders
    // these figures for share cards, reads them the same way browsers do.
    const font = (/** @type {number} */ weight, /** @type {number} */ size) =>
        `font-family:${p.mono};font-weight:${weight};font-size:${size}px`;
    /** @type {Record<string, string>} */
    const rules = {
        bg: `fill:${p.paper}`,
        'grid-minor': `fill:none;stroke:${p.accent};stroke-opacity:.05;stroke-width:1`,
        'grid-major': `fill:none;stroke:${p.accent};stroke-opacity:.12;stroke-width:1`,
        frame: `fill:none;stroke:${p.ruleStrong};stroke-width:1.5`,
        tick: `stroke:${p.ruleStrong};stroke-width:1.5`,
        zone: `fill:${p.subtle};${font(500, 11)}`,
        block: `fill:${p.surface};stroke:${p.ruleStrong};stroke-width:1.5`,
        'block-key': `fill:${p.subtle};${font(500, 10)};letter-spacing:.1em`,
        'block-value': `fill:${p.muted};${font(500, 13)}`,
        rule: `fill:none;stroke:${p.rule};stroke-width:1`,
        'rule-dash': `fill:none;stroke:${p.ruleStrong};stroke-width:1.5;stroke-dasharray:4 5`,
        wire: `fill:none;stroke:${p.subtle};stroke-width:2;stroke-linejoin:round;stroke-linecap:round`,
        'wire-ink': `fill:none;stroke:${p.muted};stroke-width:2;stroke-linejoin:round;stroke-linecap:round`,
        hl: `fill:none;stroke:${hl};stroke-width:3;stroke-linejoin:round;stroke-linecap:round`,
        'hl-fill': `fill:${wash}`,
        'hl-text': `fill:${hl};${font(600, 16)}`,
        leader: `fill:none;stroke:${hl};stroke-width:1.5;stroke-dasharray:5 4`,
        label: `fill:${p.subtle};${font(600, 14)};letter-spacing:.12em`,
        mono: `fill:${p.muted};${font(400, 16)}`,
        'mono-sm': `fill:${p.subtle};${font(400, 12)}`,
        node: `fill:${p.surface};stroke:${p.ruleStrong};stroke-width:1.5`,
        'node-hl': `fill:${p.surface};stroke:${hl};stroke-width:2.5`,
        dot: `fill:${p.subtle}`,
        'dot-hl': `fill:${hl}`,
        arrow: `fill:${p.subtle}`,
        'arrow-hl': `fill:${hl}`,
    };
    return Object.entries(rules)
        .map(([cls, css]) => `#${id} .${cls}{${css}}`)
        .join('');
}

/**
 * Graph paper, drafting border with zone markers, and the title block.
 * @param {string} id
 * @param {HeroPost} post
 * @param {Motif} motif
 */
function sheet(id, post, motif) {
    const inner = { x: MARGIN, y: MARGIN, w: W - MARGIN * 2, h: H - MARGIN * 2 };
    const defs = `<defs><pattern id="${id}-minor" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" class="grid-minor"/></pattern><pattern id="${id}-major" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" class="grid-major"/></pattern></defs>`;
    const out = [
        defs,
        rect(0, 0, W, H, 'bg'),
        `<rect x="${inner.x}" y="${inner.y}" width="${inner.w}" height="${inner.h}" fill="url(#${id}-minor)"/>`,
        `<rect x="${inner.x}" y="${inner.y}" width="${inner.w}" height="${inner.h}" fill="url(#${id}-major)"/>`,
        rect(inner.x, inner.y, inner.w, inner.h, 'frame'),
    ];

    const zoneW = inner.w / 10;
    for (let i = 0; i < 10; i++) {
        if (i > 0) {
            out.push(line(inner.x + i * zoneW, inner.y, inner.x + i * zoneW, inner.y + 8, 'tick'));
            out.push(line(inner.x + i * zoneW, inner.y + inner.h, inner.x + i * zoneW, inner.y + inner.h - 8, 'tick'));
        }
        out.push(text(inner.x + (i + 0.5) * zoneW, inner.y - 8, i + 1, 'zone', 'middle'));
        out.push(text(inner.x + (i + 0.5) * zoneW, inner.y + inner.h + 16, i + 1, 'zone', 'middle'));
    }
    const zoneH = inner.h / 5;
    for (let j = 0; j < 5; j++) {
        if (j > 0) {
            out.push(line(inner.x, inner.y + j * zoneH, inner.x + 8, inner.y + j * zoneH, 'tick'));
            out.push(line(inner.x + inner.w, inner.y + j * zoneH, inner.x + inner.w - 8, inner.y + j * zoneH, 'tick'));
        }
        const letter = String.fromCharCode(65 + j);
        out.push(text(MARGIN / 2, inner.y + (j + 0.5) * zoneH + 4, letter, 'zone', 'middle'));
        out.push(text(W - MARGIN / 2, inner.y + (j + 0.5) * zoneH + 4, letter, 'zone', 'middle'));
    }

    // Title block, bottom right.
    const bw = 300;
    const bh = 64;
    const bx = inner.x + inner.w - bw;
    const by = inner.y + inner.h - bh;
    const split = 110;
    const date = post.pubDate instanceof Date && !Number.isNaN(post.pubDate.valueOf()) ? post.pubDate.toISOString().slice(0, 10) : '—';
    /** @type {[number, number, string, string][]} */
    const cells = [
        [bx, by, 'FIG.', post.number ?? '—'],
        [bx + split, by, 'TYPE', MOTIF_NAMES[motif]],
        [bx, by + bh / 2, 'DATE', date],
        [bx + split, by + bh / 2, 'REF', truncate(post.slug, 22)],
    ];
    out.push(rect(bx, by, bw, bh, 'block'));
    out.push(line(bx, by + bh / 2, bx + bw, by + bh / 2, 'frame'));
    out.push(line(bx + split, by, bx + split, by + bh, 'frame'));
    for (const [cx, cy, key, value] of cells) {
        out.push(text(cx + 8, cy + 12, key, 'block-key'));
        out.push(text(cx + 8, cy + 27, value, 'block-value'));
    }

    return out.join('');
}

/**
 * Render a post's hero figure.
 * @param {HeroPost} post
 * @param {object} [options]
 * @param {'css' | import('./palette.js').Palette} [options.palette] `'css'` (default) uses the site's tokens.
 * @param {Motif} [options.motif] Override the motif.
 * @param {string | number} [options.seed] Override the seed.
 * @param {string[]} [options.labels] Override the labels.
 * @param {string} [options.id] Unique element id, when rendering several figures into one document.
 * @returns {{ svg: string, motif: Motif, source: string, seed: string | number }}
 */
export function renderHero(post, options = {}) {
    if (options.motif && !MOTIFS.includes(options.motif)) {
        throw new Error(`Unknown hero motif "${options.motif}". Use one of: ${MOTIFS.join(', ')}.`);
    }
    const { motif, source } = chooseMotif(post, options.motif);
    const seed = options.seed ?? post.hero?.seed ?? post.slug;
    const palette = resolvePalette(options.palette ?? 'css');
    const failed = /abandon|fail|dead|broken/i.test(post.status ?? '');
    const id = `nh-${(options.id ?? post.slug).replace(/[^a-zA-Z0-9-]/g, '-')}`;
    const labels = (options.labels ?? post.hero?.labels ?? post.tags ?? titleWords(post.title)).map((label) => label.toUpperCase());

    const body = RENDERERS[motif]({ rand: createRandom(seed), area: AREA, post, labels });
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" id="${id}" class="notebook-hero" data-motif="${motif}" aria-hidden="true">` +
        `<style>${styles(id, palette, failed)}</style>${sheet(id, post, motif)}${body}</svg>`;

    return { svg, motif, source, seed };
}
