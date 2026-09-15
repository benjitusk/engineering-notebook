// @ts-check
import { circle, line, path, rect, text, r } from '../svg.js';

/**
 * Board layout: a header connector routed to an IC, one net highlighted.
 * @param {import('../index.js').MotifContext} ctx
 */
export default function traces({ rand, area: a, labels }) {
    const pins = 6;
    const pitch = 40;
    const chipW = 170;
    const chipH = pins * pitch + 20;
    const chipX = a.x + a.w * 0.58;
    const chipY = a.y + (a.h - chipH) / 2;
    const padX = a.x + 70;
    const padPitch = (a.h - 50) / (pins - 1);
    const names = rand.shuffle(['VCC', 'GND', 'SDA', 'SCL', 'RST', 'INT']);
    const highlighted = rand.int(0, pins - 1);

    const wires = [];
    const vias = [];
    const pads = [];

    for (let i = 0; i < pins; i++) {
        const padY = a.y + 25 + i * padPitch;
        const pinY = chipY + 30 + i * pitch;
        const dy = Math.abs(pinY - padY);
        const bendX = padX + 120 + i * 28 - dy / 2;
        const d = `M${r(padX + 10)} ${r(padY)} H${r(bendX)} L${r(bendX + dy)} ${r(pinY)} H${r(chipX - 18)}`;
        wires.push(path(d, i === highlighted ? 'hl' : 'wire'));
        if (rand.chance(0.4)) vias.push(circle(bendX + dy / 2, (padY + pinY) / 2, 5, 'node'));
        pads.push(circle(padX, padY, 9, i === highlighted ? 'node-hl' : 'node'));
        pads.push(text(padX - 18, padY + 4, names[i], i === highlighted ? 'hl-text' : 'mono-sm', 'end'));
    }

    const chip = [rect(chipX, chipY, chipW, chipH, 'node', 4), circle(chipX + 14, chipY + 14, 4, 'dot')];
    for (let i = 0; i < pins; i++) {
        const pinY = chipY + 30 + i * pitch;
        chip.push(line(chipX - 18, pinY, chipX, pinY, 'wire-ink'));
        const reach = chipX + chipW + 40 + rand.int(0, 60);
        chip.push(line(chipX + chipW, pinY, reach, pinY, 'wire'));
        chip.push(circle(reach + 6, pinY, 6, 'node'));
    }
    const part = labels.find((label) => label.length <= 10) ?? 'MCU';
    chip.push(text(chipX + chipW / 2, chipY + chipH / 2 - 2, part, 'mono', 'middle'));
    chip.push(text(chipX + chipW / 2, chipY + chipH / 2 + 20, 'U1', 'mono-sm', 'middle'));

    // Dimension line under the chip.
    const dimY = chipY + chipH + 22;
    const dimension = [
        line(chipX, dimY, chipX + chipW, dimY, 'wire'),
        line(chipX, dimY - 6, chipX, dimY + 6, 'wire'),
        line(chipX + chipW, dimY - 6, chipX + chipW, dimY + 6, 'wire'),
        text(chipX + chipW / 2, dimY + 18, `${rand.pick(['7.5', '10.3', '12.8'])} mm`, 'mono-sm', 'middle'),
    ];

    const connector = [
        rect(padX - 16, a.y + 5, 32, a.h - 10, 'rule', 3),
        text(padX, a.y - 6, 'J1', 'mono-sm', 'middle'),
    ];

    return [...connector, ...wires, ...vias, ...pads, ...chip, ...dimension].join('');
}
