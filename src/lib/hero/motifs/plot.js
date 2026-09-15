// @ts-check
import { circle, line, path, polyline, text } from '../svg.js';

/**
 * Measurement plot: noisy samples, a fitted curve, a target, and one outlier
 * circled with a question mark.
 * @param {import('../index.js').MotifContext} ctx
 */
export default function plot({ rand, area: a }) {
    const left = a.x + 56;
    const bottom = a.y + a.h - 36;
    const right = a.x + a.w - 10;
    const top = a.y + 14;
    const X = (/** @type {number} */ t) => left + t * (right - left);
    const Y = (/** @type {number} */ v) => bottom - v * (bottom - top);

    const out = [];

    // Axes, ticks, and grid.
    const xStep = rand.pick([5, 10, 25, 50]);
    const yStep = rand.pick([1, 2, 5, 10]);
    for (let j = 1; j <= 5; j++) {
        const y = Y(j / 5);
        out.push(line(left, y, right, y, 'rule'));
        out.push(text(left - 10, y + 4, j * yStep, 'mono-sm', 'end'));
    }
    for (let i = 1; i <= 8; i++) {
        const x = X(i / 8);
        out.push(line(x, bottom, x, bottom + 6, 'wire-ink'));
        out.push(text(x, bottom + 22, i * xStep, 'mono-sm', 'middle'));
    }
    out.push(path(`M${left} ${top} V${bottom} H${right}`, 'wire-ink'));
    out.push(text(left + 8, top - 2, rand.pick(['V', 'ms', '%', 'dB']), 'label'));
    out.push(text(right, bottom + 44, rand.pick(['t / s', 'SAMPLES', 'ITERATION', 'n']), 'label', 'end'));

    // Model, target, and samples.
    const amplitude = rand.range(0.55, 0.85);
    const rate = rand.range(0.15, 0.4);
    const model = (/** @type {number} */ t) => amplitude * (1 - Math.exp(-t / rate));
    const target = amplitude * rand.range(0.86, 0.95);
    out.push(line(left, Y(target), right, Y(target), 'rule-dash'));
    out.push(text(left + 10, Y(target) - 8, 'TARGET', 'mono-sm'));

    /** @type {[number, number][]} */
    const fit = Array.from({ length: 61 }, (_, i) => [X(i / 60), Y(model(i / 60))]);
    out.push(polyline(fit, 'hl'));

    const samples = 26;
    const outlier = rand.int(8, samples - 5);
    for (let i = 0; i < samples; i++) {
        const t = (i + 0.5) / samples;
        let v = model(t) + rand.range(-0.05, 0.05);
        if (i === outlier) v += rand.pick([-0.3, 0.26]);
        out.push(circle(X(t), Y(v), 4, 'dot'));
        if (i === outlier) {
            out.push(circle(X(t), Y(v), 14, 'leader'));
            out.push(text(X(t) + 20, Y(v) - 12, '?', 'hl-text'));
        }
    }

    return out.join('');
}
