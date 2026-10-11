// @ts-check
// The sensor: a fingerprint in its window, pins out to the USB and I²C sides, and a captured signal above.
import { fingerprint, label } from '../draw.js';

export default function draw() {
    const pins = [170, 200, 230, 260, 290, 310].map((x) => `<path class="s-ink" d="M${x} 320V340"/>`).join('');
    return [
        '<path class="s-mute" d="M140 96h20v-16h12v16h28v-16h8v16h20v-16h24v16h12v-16h16v16h60"/>',
        '<rect class="s-ink" x="140" y="120" width="200" height="200" rx="8"/>',
        '<rect class="s-mute" x="160" y="140" width="160" height="160" rx="4"/>',
        fingerprint(240, 220, 6, 's-acc'),
        pins,
        '<path class="s-mute" d="M200 340V372H96M290 340V372H384"/>',
        label(96, 362, 'USB', 't-acc'),
        label(384, 362, 'I²C', 't-acc', 'end'),
    ].join('');
}
