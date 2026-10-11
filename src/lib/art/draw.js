// @ts-check
// Shared pieces for the hand-drawn post drawings in ./drawings. Every drawing is
// on a 480 × 480 canvas and styled only through the classes in ./index.js, so
// the same markup renders with CSS tokens (site) or literal colours (share cards).

import { esc } from '../hero/svg.js';

/**
 * A mono label.
 * @param {number} x @param {number} y
 * @param {string} content
 * @param {string} [cls] Extra class: t-acc, t-warn or t-ink.
 * @param {'start' | 'middle' | 'end'} [anchor]
 */
export function label(x, y, content, cls = '', anchor = 'start') {
    const align = anchor === 'start' ? '' : ` text-anchor="${anchor}"`;
    return `<text x="${x}" y="${y}" class="t ${cls}"${align}>${esc(content)}</text>`;
}

const GAPS = ['100 0', '62 5 30 3', '40 4 52 4', '85 6 9 0', '30 3 64 3', '70 4 22 4'];

/**
 * A fingerprint: nested, broken ellipses.
 * @param {number} cx @param {number} cy
 * @param {number} rings
 * @param {string} cls
 */
export function fingerprint(cx, cy, rings, cls) {
    let out = `<g transform="rotate(-12 ${cx} ${cy})">`;
    for (let i = 0; i < rings; i++) {
        out +=
            `<ellipse class="${cls}" cx="${cx}" cy="${cy}" rx="${8 + i * 11}" ry="${11 + i * 14}" pathLength="100"` +
            ` stroke-dasharray="${GAPS[i % GAPS.length]}" stroke-dashoffset="${i * 17}"/>`;
    }
    return `${out}</g>`;
}

/**
 * A grid of CPU cores, some of them busy.
 * @param {{ x: number, y: number, size: number, gap: number, cols: number, rows: number }} grid
 * @param {string} idle Class for idle cores.
 * @param {string} busy Class for busy cores.
 * @param {[number, number][]} lit [col, row] of each busy core.
 */
export function cores({ x, y, size, gap, cols, rows }, idle, busy, lit) {
    let out = '';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const on = lit.some(([c, r]) => c === col && r === row);
            out += `<rect class="${on ? busy : idle}" x="${x + col * (size + gap)}" y="${y + row * (size + gap)}" width="${size}" height="${size}" rx="2"/>`;
        }
    }
    return out;
}

/**
 * A heartbeat that stops: `beats` spikes from x0, then a flat line to x1.
 * @param {number} x0 @param {number} base @param {number} beats @param {number} x1
 */
export function heartbeat(x0, base, beats, x1) {
    let d = `M${x0 - 16} ${base}H${x0}`;
    for (let b = 0; b < beats; b++) {
        const x = x0 + b * 64;
        d += `L${x + 8} ${base - 16}L${x + 16} ${base}H${x + 24}L${x + 30} ${base - 64}L${x + 38} ${base + 56}L${x + 44} ${base}H${x + 64}`;
    }
    const stop = x0 + beats * 64;
    return { d, stop, flat: `M${stop} ${base}H${x1}` };
}
