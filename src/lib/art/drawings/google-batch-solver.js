// @ts-check
// A 32-vCPU Batch VM where the solver only keeps a couple of cores busy.
import { cores, label } from '../draw.js';

export default function draw() {
    return [
        label(100, 118, 'BATCH VM', 't-acc'),
        '<rect class="s-ink" x="100" y="130" width="280" height="200" rx="4"/>',
        '<line class="s-mute" x1="100" x2="380" y1="158" y2="158"/>',
        cores({ x: 116, y: 178, size: 24, gap: 8, cols: 8, rows: 4 }, 's-mute', 'f-acc', [[0, 3], [1, 3]]),
        '<path class="s-acc" d="M144 302V362"/>',
        label(152, 366, 'solver', 't-acc'),
        '<path class="s-mute" d="M116 388H364M116 380v16M364 380v16"/>',
        label(240, 412, '32 vCPU', '', 'middle'),
    ].join('');
}
