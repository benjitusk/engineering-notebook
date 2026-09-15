// @ts-check
import { line, path, rect, text, r } from '../svg.js';

/**
 * Logic-analyzer capture: a clock, data lines, and one decoded byte.
 * @param {import('../index.js').MotifContext} ctx
 */
export default function timing({ rand, area: a, post }) {
    const tags = (post.tags ?? []).join(' ').toLowerCase();
    const channels = /spi/.test(tags)
        ? ['SCK', 'MOSI', 'MISO', 'CS']
        : /uart|serial/.test(tags)
          ? ['TX', 'RX']
          : /i²c|i2c/.test(tags)
            ? ['SCL', 'SDA', 'INT']
            : rand.pick([
                  ['SCL', 'SDA', 'INT'],
                  ['SCK', 'MOSI', 'MISO'],
                  ['CLK', 'DATA', 'EN'],
              ]);

    const x0 = a.x + 72;
    const period = 32;
    const count = Math.floor((a.x + a.w - x0) / period);
    const end = x0 + count * period;
    const rowH = a.h / channels.length;
    const slant = 3;
    const high = (/** @type {number} */ row) => a.y + row * rowH + rowH * 0.3;
    const low = (/** @type {number} */ row) => a.y + row * rowH + rowH * 0.72;

    // Every data line gets random bits; the second channel carries the decoded byte.
    const bits = channels.map(() => Array.from({ length: count }, () => (rand.chance(0.5) ? 1 : 0)));
    const start = rand.int(Math.floor(count * 0.2), Math.max(Math.floor(count * 0.2), count - 10));
    const byteStart = x0 + start * period;
    const byteEnd = byteStart + 8 * period;
    const value = bits[1].slice(start, start + 8).reduce((/** @type {number} */ acc, bit) => acc * 2 + bit, 0);
    const hex = `0x${value.toString(16).toUpperCase().padStart(2, '0')}`;
    const glyph = value >= 0x21 && value <= 0x7e ? ` · '${String.fromCharCode(value)}'` : '';

    /**
     * @param {number[]} levels
     * @param {number} row
     * @param {number} from
     * @param {number} to
     */
    const wave = (levels, row, from, to) => {
        const y = (/** @type {number} */ bit) => (bit ? high(row) : low(row));
        let d = `M${r(x0 + from * period)} ${r(y(levels[from]))}`;
        for (let i = from + 1; i < to; i++) {
            const x = x0 + i * period;
            if (levels[i] !== levels[i - 1]) {
                d += ` L${r(x - slant)} ${r(y(levels[i - 1]))} L${r(x + slant)} ${r(y(levels[i]))}`;
            }
        }
        return `${d} L${r(x0 + to * period)} ${r(y(levels[to - 1]))}`;
    };

    const out = [rect(byteStart, a.y, 8 * period, a.h, 'hl-fill')];

    channels.forEach((name, row) => {
        out.push(text(a.x, (high(row) + low(row)) / 2 + 5, name, 'label'));

        if (row === 0) {
            let d = `M${r(x0)} ${r(low(row))}`;
            for (let i = 0; i < count; i++) {
                const mid = x0 + i * period + period / 2;
                const next = x0 + (i + 1) * period;
                const fall = i === count - 1 ? `L${r(next)} ${r(high(row))}` : `L${r(next - slant)} ${r(high(row))} L${r(next + slant)} ${r(low(row))}`;
                d += ` L${r(mid - slant)} ${r(low(row))} L${r(mid + slant)} ${r(high(row))} ${fall}`;
            }
            out.push(path(d, 'wire-ink'));
            return;
        }

        out.push(path(wave(bits[row], row, 0, count), 'wire'));
        if (row === 1) {
            out.push(path(wave(bits[row], row, start, start + 8), 'hl'));
            for (let i = 0; i < 8; i++) {
                out.push(text(byteStart + i * period + period / 2, high(row) - 10, bits[row][start + i], 'mono-sm', 'middle'));
            }
        }
    });

    // Decoded-byte bracket and edges.
    out.push(line(byteStart, a.y, byteStart, a.y + a.h, 'leader'));
    out.push(line(byteEnd, a.y, byteEnd, a.y + a.h, 'leader'));
    out.push(path(`M${r(byteStart)} ${r(a.y - 2)} V${r(a.y - 12)} H${r(byteEnd)} V${r(a.y - 2)}`, 'hl'));
    out.push(text((byteStart + byteEnd) / 2, a.y - 20, `${hex}${glyph}`, 'hl-text', 'middle'));
    out.push(line(x0, a.y + a.h + 6, end, a.y + a.h + 6, 'rule'));

    return out.join('');
}
