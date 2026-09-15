// @ts-check
import { CHAR_WIDTH as cw, line, path, rect, text, r } from '../svg.js';

/**
 * Hex dump of a capture, with the post's slug hidden in the bytes as a
 * highlighted "magic" header.
 * @param {import('../index.js').MotifContext} ctx
 */
export default function hexdump({ rand, area: a, post }) {
    const cols = 16;
    const rows = 9;
    const lineHeight = 30;

    const bytes = Array.from({ length: rows * cols }, () => {
        const roll = rand.next();
        return roll < 0.3 ? 0x00 : roll < 0.38 ? 0xff : rand.int(0x01, 0xfe);
    });
    const signature = [...new TextEncoder().encode(post.slug.toUpperCase())].slice(0, 12);
    const sigRow = rand.int(2, rows - 2);
    const sigCol = rand.int(0, cols - signature.length);
    signature.forEach((byte, i) => {
        bytes[sigRow * cols + sigCol + i] = byte;
    });
    const base = rand.int(0, 0x7ff) * 16;

    const hex = (/** @type {number} */ byte) => byte.toString(16).toUpperCase().padStart(2, '0');
    const glyph = (/** @type {number} */ byte) => (byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : '.');

    const hexX = a.x + 10 * cw;
    const asciiX = hexX + (cols * 3 + 1) * cw;
    const top = a.y + 16;
    const back = [];
    const out = [];

    out.push(text(a.x, top, 'OFFSET', 'mono-sm'));
    for (let i = 0; i < cols; i++) out.push(text(hexX + i * 3 * cw + cw, top, hex(i), 'mono-sm', 'middle'));
    out.push(text(asciiX, top, 'ASCII', 'mono-sm'));
    out.push(line(a.x, top + 10, asciiX + cols * cw, top + 10, 'rule'));

    for (let row = 0; row < rows; row++) {
        const y = top + 14 + (row + 1) * lineHeight;
        const rowBytes = bytes.slice(row * cols, (row + 1) * cols);
        out.push(text(a.x, y, (base + row * cols).toString(16).toUpperCase().padStart(8, '0'), 'mono-sm'));

        const isSig = row === sigRow;
        const to = sigCol + signature.length;
        /** @type {[number, number, string][]} */
        const segments = isSig
            ? [
                  [0, sigCol, 'mono'],
                  [sigCol, to, 'hl-text'],
                  [to, cols, 'mono'],
              ]
            : [[0, cols, 'mono']];

        for (const [from, until, cls] of segments) {
            if (from >= until) continue;
            const slice = rowBytes.slice(from, until);
            out.push(text(hexX + from * 3 * cw, y, slice.map(hex).join(' '), cls));
            out.push(text(asciiX + from * cw, y, slice.map(glyph).join(''), cls));
        }

        if (isSig) {
            back.push(rect(hexX + sigCol * 3 * cw - 5, y - 20, (signature.length * 3 - 1) * cw + 10, 28, 'hl-fill', 3));
            back.push(rect(asciiX + sigCol * cw - 4, y - 20, signature.length * cw + 8, 28, 'hl-fill', 3));
            const noteX = asciiX + cols * cw + 24;
            out.push(path(`M${r(asciiX + cols * cw + 6)} ${r(y - 6)} H${r(noteX - 6)}`, 'leader'));
            out.push(text(noteX, y, 'MAGIC?', 'hl-text'));
        }
    }

    return [...back, ...out].join('');
}
