// @ts-check
import { CHAR_WIDTH as cw, line, path, rect, text, truncate, r } from '../svg.js';

/**
 * Block diagram: the post's labels as a pipeline, with one stage flagged and a
 * loop back to the start (because it never works first time).
 * @param {import('../index.js').MotifContext} ctx
 */
export default function flow({ rand, area: a, labels }) {
    const items = (labels.length >= 2 ? labels : ['INPUT', 'PROCESS', 'OUTPUT']).slice(0, 5).map((label) => truncate(label, 12));
    const count = items.length;
    const boxH = 60;
    const widths = items.map((label) => Math.max(120, label.length * cw + 36));
    const gap = (a.w - widths.reduce((sum, w) => sum + w, 0)) / (count - 1);
    const cy = a.y + a.h * 0.38;
    const flagged = rand.int(0, count - 1);

    let x = a.x;
    const boxes = widths.map((w, i) => {
        const box = { x, w, label: items[i] };
        x += w + gap;
        return box;
    });

    const out = [];

    boxes.slice(0, -1).forEach((box, i) => {
        const from = box.x + box.w + 8;
        const to = boxes[i + 1].x - 12;
        out.push(line(from, cy, to, cy, 'wire'));
        out.push(path(`M${r(to)} ${r(cy - 6)} L${r(to + 10)} ${r(cy)} L${r(to)} ${r(cy + 6)} Z`, 'arrow'));
        out.push(text((from + to) / 2, cy - 12, String(i + 1).padStart(2, '0'), 'mono-sm', 'middle'));
    });

    boxes.forEach((box, i) => {
        const isFlagged = i === flagged;
        out.push(rect(box.x, cy - boxH / 2, box.w, boxH, isFlagged ? 'node-hl' : 'node', 4));
        out.push(text(box.x + box.w / 2, cy + 6, box.label, isFlagged ? 'hl-text' : 'mono', 'middle'));
    });

    const note = boxes[flagged];
    out.push(text(note.x + note.w / 2, cy - boxH / 2 - 14, rand.pick(['BROKE HERE', 'TODO', '?']), 'hl-text', 'middle'));

    // Feedback loop from the last stage back to the first.
    const bottom = cy + boxH / 2;
    const loopY = bottom + 70;
    const lastX = boxes[count - 1].x + boxes[count - 1].w / 2;
    const firstX = boxes[0].x + boxes[0].w / 2;
    out.push(path(`M${r(lastX)} ${r(bottom + 8)} V${r(loopY)} H${r(firstX)} V${r(bottom + 18)}`, 'leader'));
    out.push(path(`M${r(firstX - 6)} ${r(bottom + 18)} L${r(firstX)} ${r(bottom + 8)} L${r(firstX + 6)} ${r(bottom + 18)} Z`, 'arrow-hl'));
    out.push(text((lastX + firstX) / 2, loopY + 24, rand.pick(['ITERATE', 'TRY AGAIN', 'BACK TO THE DOCS']), 'hl-text', 'middle'));

    return out.join('');
}
