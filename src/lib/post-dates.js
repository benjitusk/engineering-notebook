// @ts-check
// Dates for project posts that come from git.
//
// "Last updated": the date of the most recent commit that touched the post's file.
//   - `updatedDate` in frontmatter always wins.
//   - Uncommitted edits fall back to the file's modification time, so drafts
//     in progress show a sensible date locally.
//   - Edits within a day of publishing don't count as an update. "Publishing"
//     is the later of `pubDate` and the post's first commit: `pubDate` has no
//     time, so it reads as midnight UTC, and an evening commit on the same day
//     would otherwise count as an update.
//
// Publish order: newest `pubDate` first; posts published the same day are
// ordered by their first commit (see `comparePublished`).
//
// Build-time only — it shells out to git, and CI must check out full history
// (see `fetch-depth` in .github/workflows). Without git, posts simply have no
// updated date rather than failing the build.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const CONTENT_DIR = 'src/content/projects';
const MIN_GAP_MS = 24 * 60 * 60 * 1000;

/** @type {Map<string, Date> | undefined} */
let commitDates;
/** Each file's oldest commit. @type {Map<string, Date>} */
let firstCommitDates = new Map();
/** @type {Set<string>} */
let editedFiles = new Set();

/** @param {string[]} args */
function git(args) {
    try {
        return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
        return undefined;
    }
}

/** One pass over the history of the content directory, cached for the build. */
function load() {
    if (commitDates) return;
    commitDates = new Map();

    // Each commit prints as "\0<iso date>" followed by the files it touched, newest first.
    const log = git(['log', '--format=%x00%cI', '--name-only', '--', CONTENT_DIR]) ?? '';
    /** @type {Date | undefined} */
    let commitDate;
    for (const line of log.split('\n')) {
        if (line.startsWith('\0')) {
            commitDate = new Date(line.slice(1));
        } else if (line && commitDate) {
            if (!commitDates.has(line)) commitDates.set(line, commitDate);
            // Newest first, so the last date seen for a file is its first commit.
            firstCommitDates.set(line, commitDate);
        }
    }

    const status = git(['status', '--porcelain', '--', CONTENT_DIR]) ?? '';
    editedFiles = new Set(
        status
            .split('\n')
            .map((line) => line.slice(3).trim().replace(/^"|"$/g, ''))
            .filter(Boolean)
    );
}

/**
 * The post's source file, e.g. `src/content/projects/notebook-init.mdx`.
 * @param {string} id
 */
function postFile(id) {
    return ['.mdx', '.md'].map((ext) => `${CONTENT_DIR}/${id}${ext}`).find((path) => fs.existsSync(path));
}

/**
 * When a post was last meaningfully edited, or undefined if it hasn't been.
 * @param {{ id: string, data: { pubDate: Date, updatedDate?: Date } }} post
 * @returns {Date | undefined}
 */
export function lastUpdated({ id, data }) {
    if (data.updatedDate) return data.updatedDate;

    const file = postFile(id);
    if (!file) return undefined;

    load();
    const edited = editedFiles.has(file) ? new Date(fs.statSync(file).mtimeMs) : commitDates?.get(file);
    if (!edited) return undefined;

    const published = Math.max(data.pubDate.valueOf(), firstCommitDates.get(file)?.valueOf() ?? 0);
    return edited.valueOf() - published >= MIN_GAP_MS ? edited : undefined;
}

/**
 * When the post's file was first committed. Uncommitted posts count as now.
 * @param {string} id
 */
function firstCommitted(id) {
    const file = postFile(id);
    load();
    const first = file ? firstCommitDates.get(file) : undefined;
    return first ? first.valueOf() : Date.now();
}

/**
 * Sort comparator for newest-first publish order. Ties on `pubDate` (it has no
 * time of day) go to the post committed later.
 * @param {{ id: string, data: { pubDate: Date } }} a
 * @param {{ id: string, data: { pubDate: Date } }} b
 */
export function comparePublished(a, b) {
    return (
        b.data.pubDate.valueOf() - a.data.pubDate.valueOf() ||
        firstCommitted(b.id) - firstCommitted(a.id) ||
        a.id.localeCompare(b.id)
    );
}
