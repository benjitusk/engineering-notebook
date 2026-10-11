// @ts-check
// Post art: one hand-drawn schematic per post, drawn by Claude from what the
// post is about. Each lives in ./drawings/<slug>.js and is registered below.
// A post without a drawing falls back to its generated hero figure
// (src/lib/hero), so every post always has a picture.
//
// Used by PostHero (top of the post page), FeaturedProject and ProjectListItem
// (home and projects pages), and the share cards in src/lib/og/post-card.js.
//
// Drawing rules (also in the design system's PostArt card):
// - 480 × 480 canvas; keep anything important inside 60..420 on both axes,
//   since the card panel, list thumbnail and share card each crop it differently.
// - Style only with the classes in `styles()` below, never literal colours.
// - Only label what the post itself says.

import { renderHero } from '../hero/index.js';
import { resolvePalette } from '../hero/palette.js';
import fingerprintReader from './drawings/fingerprint-reader.js';
import googleBatchSolver from './drawings/google-batch-solver.js';
import notebookInit from './drawings/notebook-init.js';
import solverWatchdog from './drawings/solver-watchdog.js';

/** @type {Record<string, () => string>} */
export const DRAWINGS = {
    'fingerprint-reader': fingerprintReader,
    'google-batch-solver': googleBatchSolver,
    'notebook-init': notebookInit,
    'solver-watchdog': solverWatchdog,
};

const SIZE = 480;

/**
 * Shapes the drawing can be framed in. The square canvas is centred and the
 * graph paper extends to fill the rest.
 *   square — panels and thumbnails (cropped further by CSS / the share card)
 *   wide   — 2:1, the post page hero, matching the generated figures
 */
const VIEWBOXES = {
    square: { x: 0, y: 0, w: SIZE, h: SIZE },
    wide: { x: -SIZE / 2, y: 0, w: SIZE * 2, h: SIZE },
};

/** @typedef {keyof typeof VIEWBOXES} Shape */

/**
 * Scoped styles, same approach as the hero figures.
 * @param {string} id
 * @param {import('../hero/palette.js').Palette} p
 */
function styles(id, p) {
    const font = (/** @type {number} */ weight, /** @type {number} */ size) =>
        `font-family:${p.mono};font-weight:${weight};font-size:${size}px`;
    /** @type {Record<string, string>} */
    const rules = {
        paper: `fill:${p.paper}`,
        'grid-minor': `fill:none;stroke:${p.accent};stroke-opacity:.06;stroke-width:1`,
        'grid-major': `fill:none;stroke:${p.rule};stroke-width:1`,
        's-ink': `fill:none;stroke:${p.ink};stroke-width:2;stroke-linecap:round;stroke-linejoin:round`,
        's-mute': `fill:none;stroke:${p.muted};stroke-width:1.5`,
        's-acc': `fill:none;stroke:${p.accent};stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round`,
        dash: 'stroke-dasharray:6 6',
        'f-acc': `fill:${p.accent}`,
        t: `fill:${p.muted};${font(400, 14)};letter-spacing:.06em`,
        't-acc': `fill:${p.accent}`,
        't-warn': `fill:${p.warning}`,
        't-ink': `fill:${p.ink}`,
    };
    return Object.entries(rules)
        .map(([cls, css]) => `#${id} .${cls}{${css}}`)
        .join('');
}

/** @param {string} slug */
export const hasDrawing = (slug) => Object.hasOwn(DRAWINGS, slug);

/**
 * Render a post's hand drawing, or null if it doesn't have one.
 * @param {string} slug
 * @param {object} [options]
 * @param {'css' | import('../hero/palette.js').Palette} [options.palette] `'css'` (default) uses the site's tokens.
 * @param {Shape} [options.shape]
 * @param {string} [options.id] Unique element id, when the same drawing appears more than once on a page.
 * @returns {string | null}
 */
export function renderDrawing(slug, options = {}) {
    if (!hasDrawing(slug)) return null;
    const p = resolvePalette(options.palette ?? 'css');
    const box = VIEWBOXES[options.shape ?? 'square'];
    const id = `na-${(options.id ?? slug).replace(/[^a-zA-Z0-9-]/g, '-')}`;
    const viewBox = `${box.x} ${box.y} ${box.w} ${box.h}`;
    const paper =
        `<defs><pattern id="${id}-minor" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 0H0V8" class="grid-minor"/></pattern>` +
        `<pattern id="${id}-major" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" class="grid-major"/></pattern></defs>` +
        `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" class="paper"/>` +
        `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="url(#${id}-minor)"/>` +
        `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="url(#${id}-major)"/>`;
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" id="${id}" class="notebook-art" preserveAspectRatio="xMidYMid slice" aria-hidden="true">` +
        `<style>${styles(id, p)}</style>${paper}${DRAWINGS[slug]()}</svg>`
    );
}

/**
 * A post's picture: its hand drawing if it has one, otherwise the generated hero figure.
 * @param {import('../hero/index.js').HeroPost} post
 * @param {object} [options]
 * @param {'css' | import('../hero/palette.js').Palette} [options.palette]
 * @param {Shape} [options.shape] Only applies to drawings; generated figures are always 2:1.
 * @param {string} [options.id]
 * @returns {{ svg: string, kind: 'drawing' | 'generated' }}
 */
export function renderPostArt(post, options = {}) {
    const drawing = renderDrawing(post.slug, options);
    if (drawing) return { svg: drawing, kind: 'drawing' };
    const { svg } = renderHero(post, { palette: options.palette, id: options.id });
    return { svg, kind: 'generated' };
}
