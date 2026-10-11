// @ts-check
// The solve's heartbeat, cut off by an OOM kill, with the client still showing "Solving".
import { heartbeat, label } from '../draw.js';

export default function draw() {
    const h = heartbeat(76, 240, 3, 408);
    return [
        label(72, 112, 'SOLVE · HEARTBEAT', 't-acc'),
        '<path class="s-mute" d="M60 240H76"/>',
        `<path class="s-acc" d="${h.d}"/>`,
        `<path class="s-mute dash" d="${h.flat}"/>`,
        `<path class="s-mute dash" d="M${h.stop} 150V330"/>`,
        label(h.stop + 8, 162, 'OOM kill', 't-warn'),
        `<path class="s-mute" d="M${h.stop} 316v8H408v-8"/>`,
        label(h.stop + 8, 344, 'no heartbeat'),
        '<rect class="s-ink" x="72" y="356" width="132" height="32" rx="16"/>',
        label(92, 377, 'SOLVING…', 't-ink'),
    ].join('');
}
