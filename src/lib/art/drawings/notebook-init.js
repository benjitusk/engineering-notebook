// @ts-check
// How a post gets to the site: an MDX file, built by Astro, deployed to Firebase Hosting.
import { label } from '../draw.js';

/** A downward arrow between two boxes. @param {number} y0 @param {number} y1 */
const arrow = (y0, y1) => `<path class="s-mute" d="M240 ${y0}V${y1}M234 ${y1 - 6}L240 ${y1}L246 ${y1 - 6}"/>`;

export default function draw() {
    return [
        '<path class="s-acc" d="M168 96H296L312 112V156H168Z M296 96V112H312"/>',
        label(240, 132, 'first-post.mdx', 't-acc', 'middle'),
        arrow(156, 196),
        '<rect class="s-ink" x="168" y="196" width="144" height="56" rx="4"/>',
        label(240, 229, 'ASTRO', 't-ink', 'middle'),
        arrow(252, 292),
        '<rect class="s-ink" x="168" y="292" width="144" height="56" rx="4"/>',
        label(240, 325, 'FIREBASE', 't-ink', 'middle'),
        arrow(348, 368),
        label(240, 390, 'notebook.benjitusk.com', '', 'middle'),
    ].join('');
}
