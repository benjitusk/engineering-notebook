---
name: proofread
description: Proofread, copyedit, polish, rewrite, or restructure a post in this engineering notebook (src/content/projects/*.md, *.mdx), or turn rough notes into a post, without changing the author's voice or breaking MDX. Also flags unused MDX imports. Use when asked to proofread, fix typos or grammar, tighten, polish, clean up, rewrite, lint, or edit a post.
---

# Proofread

Edits posts in this engineering notebook: projects, experiments, reverse engineering, debugging, and things the author is still figuring out. The job is to make the author's writing better without making it sound like someone else wrote it.

> Improve the writing. Do not improve the author out of it.

## Running it

1. **Pick the mode** from the request: `proofread`, `polish`, `rewrite`, `transform`, or `notes`. If none is named, use **proofread**.
2. **Pick the post.** Posts live in `src/content/projects/`. If the request doesn't name one and it isn't obvious from context, ask.
3. **Read the whole file** before changing anything.
4. **Edit in place with small, targeted edits** — one Edit per change, or per paragraph at most. Never rewrite the file with Write: posts contain invisible ANSI escape bytes that retyping silently drops.
5. **Report back** in two lists, each item with its line number:
   - **Changed** — what you fixed, grouped (typos, grammar, punctuation, …). One line each.
   - **Flagged, not changed** — questionable technical claims, ambiguous meaning, inconsistent names you weren't sure how to resolve, and unused imports (below). Quote the text and say why. Never apply a flagged item.

For **rewrite**, **transform**, or **notes**, also read `.claude/skills/proofread/reference.md` before editing.

## Unused imports (every mode, `.mdx` only)

Check each `import` line. A name is **used** if it appears in the post body as a component (`<Counter`), a prop or expression value (`src={grain}`, `{iconpattern}`). It is **unused** if it never appears, or appears only inside code fences or inline code — `<Counter client:visible />` inside a ` ```markdown ` example doesn't count.

Flag unused imports with their line numbers. Remove them only when asked, and then delete just those `import` lines — nothing else.

## Never touch

These are code, not prose. Changing them breaks the build or the page.

- **Frontmatter keys and non-text values** — `pubDate`, `heroImage`, `number`, `tags`, `meta`, `draft`. The `title` and `description` text may be edited only in rewrite mode or when asked.
- **`import` lines** (except removing unused ones when asked — see above), **JSX components and their props** — e.g. `<Counter client:visible />`, `<Callout variant='failed' …>`. Visible attribute text (`title="…"`, `alt="…"`, a Callout `title`/`label`) is prose and may be proofread.
- **Code fences and inline code** — including text in them that looks like prose. Quoted terminal output is evidence: an error message that spells `Satteri` stays that way even when the prose says `Sätteri`.
- **` ```ansi ` fences** — their lines contain invisible ESC characters. Don't edit those lines at all.
- **Callout markers** — `> [!console]-` stays exactly as written, including the `-`/`+` fold sign and nested `> >` prefixes. The title after the marker is prose.
- **Emoji shortcodes** — `:man_facepalming:`, `:wink:`.
- **List structure** — `- [x]` task markers, and indentation. A 4-space indented block belongs to the list item above it; changing its indent moves it out of the list.
- **URLs.** Link text is prose; the target isn't.

## Spelling and names

- **US English**, as the posts are written ("colors", "customizable", "realizing"). Don't convert to UK spelling.
- **Names:** use the spelling the author uses most in prose; flag mixes you can't resolve. Lowercase `shadcn`, as the package is named.
- Leave the author's deliberate informality alone: contractions, "etc", sentence-initial "So,".

## Modes

- **Proofread** — minimal changes. Spelling, grammar, punctuation, typos, doubled words, obvious terminology slips. Preserve the wording; don't restructure.
- **Polish** — proofread, plus clarity, flow, awkward wording, repetition, overloaded sentences. Keep the structure and the voice. Don't shorten aggressively.
- **Rewrite** — substantially improve prose and structure while keeping meaning, facts, technical detail, uncertainty, failures, and the first-person perspective. It must still sound like the same author.
- **Transform** — change format, structure, or tone as asked. Keep the facts unless told otherwise.
- **Notes** — turn rough notes into prose. Keep every substantive point; don't fill gaps. Where a fact or connection is missing, leave a placeholder like `[TODO: what was the baud rate?]` and flag it.

## Voice (every mode)

**Keep meaning exact.**
- Don't invent facts, observations, motivations, or conclusions.
- Uncertainty stays uncertain: "I think" never becomes "this is". Keep what was observed separate from what was inferred.
- Keep failed experiments, wrong assumptions, and dead ends. Don't turn them into lessons.
- A technical claim that looks wrong gets flagged, not corrected.

**Keep the author's voice.**
- First person, natural informality, dry or self-deprecating humour where it already exists, unusual but intentional phrasing.
- Don't make every sentence equally polished. A slightly odd sentence that sounds like the author beats a smooth one that doesn't.

**Don't add** things the original doesn't have:
- rhythm tricks — splitting sentences to sound punchy, fragments for emphasis, rhetorical questions, dramatic openings;
- manufactured humour, personality, or enthusiasm ("fascinating", "exciting");
- corporate or promotional language ("leveraged", "robust solution", "seamless");
- academic padding ("It is important to note that", "In order to", "Due to the fact that");
- a problem → failure → breakthrough → lesson arc that didn't happen.

These lists are about words **you** would add. Never remove the author's own: "Markdown is awesome" in the first post is a joke — keep it.

**Concise isn't short.** Cut what doesn't help the reader; keep context, evidence, reasoning, qualifications, and unknowns. Technical precision beats simplicity when the distinction matters.

## Before changing a sentence, ask

1. Is it actually unclear, wrong, or repetitive?
2. Does it get in the reader's way?
3. Or would the change only make it sound more conventionally polished?

If only the last one is true, leave it.

## Example

Original (first-post.mdx):

> Even as I was writing the above paragraph, I wanted to include the `:man_facepalming:` emoji, but to to my surprise, emoji shortcodes were not bundled by default in Astro.

- **Proofread:** `but to to my surprise` → `but to my surprise`. Nothing else.
- **Over-edited (don't):** "Naturally, I wanted a facepalm emoji here — but Astro, surprisingly, doesn't bundle shortcodes." Adds an adverb, a dash-and-aside rhythm, and a tone the author didn't use.

## Final test

Would the author plausibly have written this version themselves, just with fewer problems? If it's more polished but less theirs, move it back.
