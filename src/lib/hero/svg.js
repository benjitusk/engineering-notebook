// @ts-check
// Tiny SVG string helpers shared by the hero motifs. Coordinates are rounded
// to one decimal so output stays stable and diffable.

/** @param {number} value */
export const r = (value) => Math.round(value * 10) / 10;

/** @param {unknown} value */
export const esc = (value) =>
    String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * @param {number} x1 @param {number} y1 @param {number} x2 @param {number} y2
 * @param {string} cls
 */
export const line = (x1, y1, x2, y2, cls) =>
    `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" class="${cls}"/>`;

/**
 * @param {number} x @param {number} y @param {number} w @param {number} h
 * @param {string} cls
 * @param {number} [radius]
 */
export const rect = (x, y, w, h, cls, radius = 0) =>
    `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"${radius ? ` rx="${radius}"` : ''} class="${cls}"/>`;

/**
 * @param {number} cx @param {number} cy @param {number} radius
 * @param {string} cls
 */
export const circle = (cx, cy, radius, cls) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(radius)}" class="${cls}"/>`;

/**
 * @param {string} d
 * @param {string} cls
 */
export const path = (d, cls) => `<path d="${d}" class="${cls}"/>`;

/**
 * @param {[number, number][]} points
 * @param {string} cls
 */
export const polyline = (points, cls) =>
    `<polyline points="${points.map(([x, y]) => `${r(x)},${r(y)}`).join(' ')}" class="${cls}"/>`;

/**
 * @param {number} x @param {number} y
 * @param {unknown} content
 * @param {string} cls
 * @param {'start' | 'middle' | 'end'} [anchor]
 */
export const text = (x, y, content, cls, anchor = 'start') =>
    `<text x="${r(x)}" y="${r(y)}" class="${cls}"${anchor === 'start' ? '' : ` text-anchor="${anchor}"`}>${esc(content)}</text>`;

/** Advance width of one IBM Plex Mono character at 16px (600/1000 em). */
export const CHAR_WIDTH = 9.6;

/**
 * Shorten a label to `max` characters.
 * @param {string} label
 * @param {number} max
 */
export const truncate = (label, max) => (label.length > max ? `${label.slice(0, max - 1)}…` : label);
