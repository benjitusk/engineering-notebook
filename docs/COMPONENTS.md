# Component vocabulary

The pieces you compose pages from. You should almost never write CSS — you pick
components and pass props. For tokens and conventions, see
[STYLEGUIDE.md](./STYLEGUIDE.md).

All components live in [`src/components/`](../src/components/). Every component
also accepts a `class` prop (forwarded to its root) for the occasional layout
nudge.

---

## Layout & shell

### `BaseLayout`

The page shell: `<html>`, `<head>` (via `BaseHead`), header, `<main>`, footer.
Every page renders into its default slot.

| Prop          | Type                              | Default  | Notes                          |
| ------------- | --------------------------------- | -------- | ------------------------------ |
| `title`       | `string`                          | —        | `<title>` + OG title           |
| `description` | `string`                          | —        | meta description               |
| `image`       | `ImageMetadata`                   | fallback | OG image                       |
| `width`       | `'prose' \| 'page' \| 'wide'`     | `'page'` | Column width (see token widths) |

```astro
<BaseLayout title="Projects · Benji Tusk" description="…" width="page">
    …page content…
</BaseLayout>
```

### `Prose`

Wraps long-form content and applies all reading typography (headings, lists,
quotes, tables, inline code, code blocks, images). Markdown/MDX post bodies are
already wrapped in this by the post layout; use it directly when you hand-write
narrative markup on a page.

```astro
<Prose>
    <h2>A heading</h2>
    <p>Body copy that comes out perfectly styled.</p>
</Prose>
```

---

## Notebook vocabulary

### `Eyebrow`

A small monospace label above a heading or section.

| Prop   | Type                              | Default    |
| ------ | --------------------------------- | ---------- |
| `tone` | `'subtle' \| 'muted' \| 'accent'` | `'subtle'` |
| `as`   | tag name                          | `'p'`      |

```astro
<Eyebrow tone="accent">Currently investigating</Eyebrow>
```

### `Hero`

A page's opening statement: big headline, optional eyebrow, optional emphasised
lede, and body copy.

| Prop    | Type     | Notes                                       |
| ------- | -------- | ------------------------------------------- |
| `title` | `string` | The headline (or use a `title` slot)        |
| slot `eyebrow` | —  | Optional `<Eyebrow>` above the title        |
| slot `lede`    | —  | Optional emphasised intro line              |
| default slot   | —  | Body paragraphs                             |

```astro
<Hero title="I like building things I don't know how to build yet.">
    <Eyebrow slot="eyebrow" tone="accent">Engineering Notebook · 2026</Eyebrow>
    <Fragment slot="lede">I'm Benji, a computer science graduate…</Fragment>
    <p>This is my engineering notebook: …</p>
</Hero>
```

### `Section`

A page section with a labelled, ruled heading row and consistent vertical
rhythm. Omit `label`/`action` for an unlabelled section.

| Prop     | Type                             | Notes                          |
| -------- | -------------------------------- | ------------------------------ |
| `label`  | `string`                         | Eyebrow text for the head      |
| `action` | `{ href: string; text: string }` | Right-aligned link (e.g. "View all →") |
| `id`     | `string`                         | Anchor id                      |

```astro
<Section label="Recent investigations" action={{ href: '/blog', text: 'View all →' }}>
    …content…
</Section>
```

### `Callout`

The notebook's semantic annotation block. **Pick the variant by meaning**, not
colour (see the colour language in the style guide).

| Prop      | Type                                            | Default  |
| --------- | ----------------------------------------------- | -------- |
| `variant` | `'note' \| 'discovery' \| 'failed' \| 'warning'` | `'note'` |
| `label`   | `string` — small mono label                     | —        |
| `title`   | `string` — bold lead line                       | —        |

| Variant     | Colour   | Use for                              |
| ----------- | -------- | ------------------------------------ |
| `note`      | Charcoal | An observation / aside               |
| `discovery` | Blue     | Something found, built, or confirmed |
| `failed`    | Amber    | An experiment that didn't work       |
| `warning`   | Amber    | A caveat / unexpected behaviour      |

```astro
<Callout variant="failed" label="Experiment 04 · Failed" title="I looked at the wrong bus.">
    I was convinced the payload rode on the interrupt endpoint. It didn't.
</Callout>
```

### `Tags`

A row of monospace chips.

| Prop   | Type       |
| ------ | ---------- |
| `tags` | `string[]` |

```astro
<Tags tags={['Reverse engineering', 'Linux', 'I²C', 'USB']} />
```

### `Figure`

A captioned artifact — an image, or (via the default slot) arbitrary content
like a terminal capture or code block.

| Prop      | Type            | Notes                          |
| --------- | --------------- | ------------------------------ |
| `src`     | `ImageMetadata` | Imported image; omit to use slot |
| `alt`     | `string`        | Alt text for `src`             |
| `caption` | `string`        | Caption under the figure       |
| `width` / `height` | `number` | Passed to the optimized image |

```astro
<Figure src={photo} alt="The sensor, opened up." caption="Bridge IC next to the ribbon." />

<Figure caption="lsusb output">
    <pre>$ lsusb -d 27c6:
Bus 003 Device 006: ID 27c6:5395 Fingerprint Sensor</pre>
</Figure>
```

---

## Projects

### `FeaturedProject`

The prominent "currently investigating" card.

| Prop       | Type       | Default                        |
| ---------- | ---------- | ------------------------------ |
| `number`   | `string`   | —                              |
| `title`    | `string`   | —                              |
| `href`     | `string`   | —                              |
| `linkText` | `string`   | `'Read the investigation →'`   |
| `tags`     | `string[]` | —                              |

```astro
<FeaturedProject number="01" title="Reverse engineering a fingerprint reader"
    href="/blog/fingerprint-reader" tags={['Linux', 'I²C', 'USB']}>
    I wanted to use a Windows Hello fingerprint reader on Linux…
</FeaturedProject>
```

### `ProjectList` + `ProjectListItem`

A numbered list of investigations. Items **auto-number** (01, 02, 03…) unless an
item passes an explicit `number`.

`ProjectListItem` props:

| Prop     | Type     | Notes                              |
| -------- | -------- | ---------------------------------- |
| `title`  | `string` | —                                  |
| `href`   | `string` | —                                  |
| `number` | `string` | Optional; overrides the auto count |

```astro
<ProjectList>
    <ProjectListItem title="Learning Vim" href="/blog/learning-vim">
        Rebuilding my editing workflow around Vim.
    </ProjectListItem>
</ProjectList>
```

### `ProjectHeader`

The masthead of a project page. Normally fed automatically from post frontmatter
by the post layout — you rarely use it directly.

| Prop          | Type                     |
| ------------- | ------------------------ |
| `title`       | `string`                 |
| `number`      | `string`                 |
| `pubDate`     | `Date`                   |
| `updatedDate` | `Date`                   |
| `tags`        | `string[]`               |
| `meta`        | `Record<string, string>` |

### `MetaTable`

The aligned spec block (`STATUS`, `PLATFORM`, …). Rows render in insertion order.

| Prop   | Type                     |
| ------ | ------------------------ |
| `data` | `Record<string, string>` |

```astro
<MetaTable data={{ Status: 'Working prototype', Platform: 'Linux', Language: 'Rust' }} />
```

### `Panel`

A generic bordered surface, for one-off boxes with no dedicated component.

| Prop     | Type      | Default |
| -------- | --------- | ------- |
| `padded` | `boolean` | `true`  |
| `as`     | tag name  | `'div'` |

---

## Interactive island

### `HexDump`

A hex + ASCII inspector for captured byte streams. A React island — hydrate it
with a client directive. Also the reference for writing your own islands.

| Prop          | Type                 | Default |
| ------------- | -------------------- | ------- |
| `data`        | `string \| number[]` | —       |
| `bytesPerRow` | `number`             | `16`    |
| `startOffset` | `number`             | `0`     |
| `caption`     | `string`             | —       |

```astro
<HexDump client:visible data="53 46 3A 01 00 12 A0 FF" caption="Init packet." />
```

---

## Post frontmatter → components

The post layout wires frontmatter fields straight into `ProjectHeader`. In a
`.md`/`.mdx` post:

```yaml
---
title: Reverse engineering a fingerprint reader
description: Getting a Windows-only sensor talking to Linux.
pubDate: 2026-08-20
number: '01'                 # → "PROJECT / 01" eyebrow
tags: ['Linux', 'I²C']       # → <Tags>
meta:                        # → <MetaTable>, in this order
    Status: Working prototype
    Platform: Linux
    Language: Rust
draft: false                 # hide from indexes while true
---
```

In an `.mdx` post you can also import and use any component in the body:

```mdx
import Callout from '../../components/Callout.astro';
import { HexDump } from '../../components/HexDump.tsx';

<Callout variant="discovery" title="The status byte is a bitfield.">…</Callout>
<HexDump client:visible data="53 46 3A" />
```

---

## A full page, start to finish

```astro
---
import BaseLayout from '../components/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import Eyebrow from '../components/Eyebrow.astro';
import Section from '../components/Section.astro';
import FeaturedProject from '../components/FeaturedProject.astro';
---

<BaseLayout title="Home" description="…" width="page">
    <Hero title="I like building things I don't know how to build yet.">
        <Eyebrow slot="eyebrow" tone="accent">Engineering Notebook · 2026</Eyebrow>
        <Fragment slot="lede">I'm Benji…</Fragment>
    </Hero>

    <Section label="Currently investigating">
        <FeaturedProject number="01" title="…" href="/blog/…" tags={['Linux']}>
            …blurb…
        </FeaturedProject>
    </Section>
</BaseLayout>
```

No CSS. That's the point.
