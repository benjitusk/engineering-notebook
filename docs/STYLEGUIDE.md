# Style guide

How to extend this site without breaking its consistency. Keep this open while
you work. For the component API reference, see [COMPONENTS.md](./COMPONENTS.md).

---

## The one rule

> Make it look like a beautiful engineering notebook, not a website pretending
> to be one.

The character comes from **typography + whitespace + graph paper + metadata +
real technical artifacts + honest writing** — not from decorative "tech"
imagery. When in doubt, add restraint, not decoration.

---

## The golden rule of the CSS

**Never hardcode a colour, size, or spacing value. Always reference a token.**

```css
/* no */                          /* yes */
color: #356a8a;                   color: var(--accent);
padding: 32px;                    padding: var(--space-8);
font-size: 18px;                  font-size: var(--text-md);
```

Every token lives in [`src/styles/tokens.css`](../src/styles/tokens.css). If you
find yourself wanting a value that isn't there, add a token first, then use it.
This is what keeps the whole site coherent — and what makes a future dark theme
a one-file change.

---

## How the styling is organised

```
src/styles/
├── global.css     ← imported once (in BaseHead). Just @imports the four below.
├── tokens.css     ← the design vocabulary. THE source of truth. Edit here.
├── reset.css      ← box model + media/form normalisation. Rarely touched.
├── base.css       ← on-brand defaults for raw elements (body, headings, a, hr…)
└── notebook.css   ← the graph-paper background
```

Everything else is **component-scoped**: each `.astro` component owns its styles
in a `<style>` block, and each React island owns a co-located `.module.css`.
There is no global "utilities" soup and no Tailwind.

---

## Token reference

### Palette

| Token               | Value     | Use for                                    |
| ------------------- | --------- | ------------------------------------------ |
| `--background`      | `#F7F7F5` | The page / paper                           |
| `--surface`         | `#FFFFFF` | Raised cards, panels                       |
| `--text`            | `#181A1B` | Primary ink, headings                      |
| `--text-muted`      | `#686D70` | Body copy, secondary text                  |
| `--text-subtle`     | `#969B9E` | Metadata, captions, de-emphasised          |
| `--border`          | `#DCDDD9` | Hairline dividers, most borders            |
| `--border-strong`   | `#C5C7C3` | Emphasised borders                         |
| `--accent`          | `#356A8A` | Links, discovery — **never default text**  |
| `--accent-hover`    | `#28546E` | Accent hover state                         |
| `--accent-subtle`   | `#E7EFF3` | Pale wash behind accented surfaces         |
| `--warning`         | `#985D11` | Failed experiments / warnings **only**     |
| `--warning-subtle`  | `#F5EBDD` | Warning washes                             |
| `--success`         | `#37704A` | Confirmed / passed / done **only**         |
| `--success-subtle`  | `#EDF4EE` | Success washes                             |
| `--danger`          | `#A3403A` | Errors, hazards, bugs **only**             |
| `--danger-subtle`   | `#F9EEEC` | Danger washes                              |
| `--example`         | `#67588F` | Worked examples / specimens **only**       |
| `--example-subtle`  | `#F2F0F7` | Example washes                             |
| `--code-background` | `#ECEDEA` | Code / technical surfaces                  |

### Typography

The site is set in **IBM Plex** — one engineered family doing everything. Plex
Sans carries body and headings; Plex Mono carries anything technical (eyebrows,
tags, metadata, project numbers, code). Both are self-hosted through Astro's
font pipeline (configured in `astro.config.mjs`), and the `--font-plex-*` CSS
variables they expose are wired into the tokens below — you always reference
`--font-sans` / `--font-mono`, never the raw family names.

- Families: `--font-sans` (Plex Sans, body & headings), `--font-mono` (Plex
  Mono, labels/metadata/tags/code/numbers).
- Sizes: `--text-2xs`, `--text-xs`, `--text-sm`, `--text-base`, `--text-md`
  (body default), `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl`, plus
  fluid `--display-lg` and `--display-hero`.
- Weights: `--weight-normal` (400), `--weight-medium` (500), `--weight-semibold`
  (600), `--weight-bold` (700) — all four are real loaded weights, so use them.
  Headings and the hero use `--weight-bold`; branding and labels use
  `--weight-semibold`.
- Line-height: `--leading-none/tight/snug/normal/relaxed`.
- Letter-spacing: `--tracking-tighter` (hero) … `--tracking-widest` (branding).

**Changing the type system** is a two-step edit: swap the family entries in
`astro.config.mjs` (and their `--font-*` cssVariables), then point `--font-sans`
/ `--font-mono` at the new variables in `tokens.css`. Nothing else changes.

### Spacing

`--space-1` … `--space-36`, where **the number is quarter-rems**: `--space-4`
= 1rem, `--space-8` = 2rem, `--space-16` = 4rem. Predictable and composable.

### Layout, radii, borders, motion

- Widths: `--measure-prose` (720px reading), `--measure-page` (900px, default),
  `--measure-wide` (1100px, header). Page padding: `--gutter`.
- Radii: `--radius-sm/–/md` (kept small on purpose — this is a notebook).
- Borders: `--border-width`. Motion: `--ease`, `--duration-fast`, `--duration`.
- Stacking: `--z-header`.

---

## Semantic colour language

Colour carries meaning here. Use it by what the thing **is**, not by taste.

| Meaning                                   | Colour   | Token       | Where it shows up          |
| ----------------------------------------- | -------- | ----------- | -------------------------- |
| Observation / explanation                 | Charcoal | `--text*`   | Body copy, `Callout` note  |
| Discovery / implementation / links        | Blue     | `--accent`  | Links, `Callout` discovery |
| Failed experiment / warning / unexpected  | Amber    | `--warning` | `Callout` failed / warning |
| Confirmed / passed / done                 | Green    | `--success` | Markdown callouts          |
| Error / hazard / bug                      | Red      | `--danger`  | Markdown callouts          |
| Worked example / specimen                 | Violet   | `--example` | Markdown callouts          |

This maps directly onto `<Callout variant="…">` — see below. The blue is an
accent, not the primary text colour; if a page looks blue, pull it back.

Markdown callouts (`> [!type] Title`) follow the same language and build on
`<Callout>`'s look. Colour carries the meaning; typography and the left rule
separate types that share a colour:

| Types                              | Colour   | Treatment                                         |
| ---------------------------------- | -------- | ------------------------------------------------- |
| `note`, `info`                     | Charcoal | Mono label                                        |
| `abstract`/`summary`/`tldr`        | Ink      | No wash, sans headline title, body in ink         |
| `todo`                             | Charcoal | Dashed rule, no wash — unfinished                 |
| `question`/`help`/`faq`            | Blue     | Dashed rule, no wash, italic headline title       |
| `quote`/`cite`                     | Charcoal | No box — a rule and italic ink                    |
| `example`                          | Violet   | Mono label                                        |
| `tip`/`hint`                       | Blue     | Mono label                                        |
| `important`                        | Blue     | Mono label, body in ink                           |
| `success`/`check`/`done`           | Green    | Mono label                                        |
| `warning`/`attention`/`caution`    | Amber    | Mono label                                        |
| `failure`/`fail`/`missing`         | Amber    | Sans headline title (like `<Callout variant="failed">`) |
| `danger`/`error`                   | Red      | Mono label                                        |
| `bug`                              | Red      | Dashed rule                                       |

`console` is for captured terminal output — put the output in an `ansi` code
fence so its colours survive. Callout styles live in `Prose.astro`.

---

## Typography & layout in practice

- **Body text** is `--font-sans` at `--text-md` / `--leading-relaxed`, coloured
  `--text-muted`. You get this for free inside `<Prose>`.
- **Anything technical or label-like** — eyebrows, tags, metadata, project
  numbers, code — is `--font-mono`, usually uppercase with wide tracking.
- **Reading width** is `--measure-prose` (720px). Composed pages use
  `--measure-page` (900px). Pick the `width` prop on `<BaseLayout>` accordingly.
- **Vertical rhythm** between sections is handled by `<Section>` / `<Hero>`
  margins; between prose blocks by `<Prose>`. You should rarely set margins by
  hand on a page.

---

## Adding to the site

### Do I need a new component, or just `<Prose>`?

- **Writing a post?** Just write Markdown/MDX. It renders inside `<Prose>` and
  comes out styled. Reach for components (`<Callout>`, `<Figure>`, `<HexDump>`)
  only for things prose can't express.
- **Building a page** (home, index, landing)? Compose existing components inside
  `<BaseLayout>`. Aim for **zero page-level CSS** — if you're writing a `<style>`
  block on a page, ask whether it belongs in a component instead.
- **Repeating a pattern** two or more times? That's a component.

### Authoring a new component

Follow the conventions the existing wrappers use so yours feels native:

```astro
---
/** One-line purpose + a usage example in a JSDoc comment. */
interface Props {
    variant?: 'a' | 'b';   // variants as string unions
    class?: string;        // always accept a class passthrough
}
const { variant = 'a', class: className } = Astro.props;
---

<div class:list={['thing', className]} data-variant={variant}>
    <slot />
</div>

<style>
    .thing {
        /* tokens only — no raw hex/px */
        padding: var(--space-6);
        color: var(--text-muted);
    }
    .thing[data-variant='b'] {
        color: var(--accent);
    }
</style>
```

Conventions:

- **Tokens only** in the `<style>` block.
- **Variants** are string-union props switched with a `data-variant` attribute
  (see `Callout`, `Eyebrow`), not separate class names the caller must know.
- **Always** accept and forward `class` via `class:list` so callers can nudge
  layout without you exposing internals.
- Prefer **slots** over stringly-typed content props. Use `Astro.slots.has(name)`
  to render optional wrappers (see `Hero`).
- Style slotted markup with `:global(...)` scoped under your root class (see
  `Prose`, `Callout`).

---

## React islands

Astro renders everything to static HTML by default. Reach for a React island
**only when you need client-side interactivity** (state, input, live updates).
Most of this site is static and should stay that way.

- **Add an island** as a `.tsx` component and hydrate it where used with a
  client directive: `client:visible` (most common — hydrate when scrolled into
  view), `client:idle`, or `client:load` (only for above-the-fold interactivity).
- **Style it with a co-located CSS Module** (`Thing.module.css`) that consumes
  the same tokens as everything else. **No Tailwind, no inline colours.** Import
  it as `import styles from './Thing.module.css'` and reference
  `className={styles.foo}`.

```tsx
import styles from './Thing.module.css';
export function Thing() {
    return <span className={styles.byte}>3F</span>;
}
```

```css
/* Thing.module.css — scoped classes, tokenised values */
.byte {
    color: var(--accent);
    background: var(--code-background);
    font-family: var(--font-mono);
}
```

The reference implementation is
[`HexDump.tsx`](../src/components/HexDump.tsx) +
[`HexDump.module.css`](../src/components/HexDump.module.css) — copy its shape for
typed props, `useMemo`/`useCallback`, keyboard support, and token-driven module
styling.

---

## Dark mode

Dark mode follows the reader's OS preference. It is a single block at the
bottom of `tokens.css` that reassigns the palette tokens — nothing else in the
codebase changes. Put `data-theme="light"` on `<html>` to keep a page on the
light paper.

As long as you follow the golden rule, new work is dark-mode compatible for
free. The dark condition is repeated in exactly two other places — the `dark`
variant in `global.css` and the Shiki colour swap in `Prose.astro` — keep them
in step if it ever changes.
