# Proofread — reference for rewrite, transform, and notes

Read this before a **rewrite**, **transform**, or **notes** job. Proofread and polish don't need it. Everything in `SKILL.md` still applies.

## What the notebook is

An engineering notebook, not a portfolio. It documents investigations while they're still in progress. The writing should show competence through the work — questions, observations, experiments, evidence, failures, results, remaining unknowns — never by telling the reader a project was difficult or impressive.

Assume a reader who is technically curious and comfortable with computers but may not know the specific system. Explain a concept when the reader needs it to follow along; don't turn a post into a textbook.

## Structure

- **Start with the actual problem**: the observation, question, broken thing, or strange behaviour that started the investigation. Don't manufacture a hook, and don't open with a paragraph announcing what the article will do.
- **Follow how understanding actually developed.** Useful pieces, in whatever order happened: context, the problem, first attempts, observations, experiments, wrong assumptions, new evidence, revised understanding, implementation, results, remaining questions. This is a menu, not a template — don't invent a missing failure or breakthrough to complete it.
- **Make reasoning visible where an action would otherwise look arbitrary**: observation → hypothesis → experiment → result → conclusion. Don't force that chain onto every paragraph.
- **Keep hypotheses and conclusions distinguishable.** A reader should always be able to tell what was confirmed from what was suspected.

## Headings, paragraphs, lists

- **Headings** should name something specific — a component, an experiment, a question, a stage. Add one when it helps navigation, not for visual rhythm. Don't make them clever.
- **Paragraphs** have one subject, but their length follows the content. Some ideas need several paragraphs; some need one sentence.
- **Lists** suit requirements, components, variables, commands, options, comparisons, steps, and reference data. Don't convert narrative into bullets because bullets look organized.

## Evidence over description

When code, terminal output, a packet capture, hex dump, table, measurement, photo, log, or config file shows something more clearly, use it. The prose around it should say what matters about the evidence, not restate what's visible in it.

Site components exist for this — `<HexDump>`, `<Figure>`, `<Callout>`, `<MetaTable>`, and Markdown callouts like `> [!console]` for terminal output (see `docs/COMPONENTS.md` and `docs/STYLEGUIDE.md`). In rewrite mode you may suggest one; don't add a component without saying so in the report.

## Titles and descriptions

- **Title**: says what the investigation is about, or the question that drove it. No clickbait, no exaggeration, no "curious question + surprising result" formula unless that's genuinely the post.
- **Description** (frontmatter): one or two sentences on what the post contains — the system, the problem, the investigation, what was found. Not promotional.

## Turning notes into a post

- Keep every substantive point; merge duplicates.
- Group related observations; put events in order when order matters.
- Make reasoning explicit only where the notes contain it.
- Keep uncertainty, failures, and wrong turns.
- Don't turn sparse notes into a complete-sounding story. Where a fact or causal link is missing, leave `[TODO: …]` and flag it rather than inventing one.

## When the technical story is unclear

1. Keep the uncertainty.
2. Separate what was observed from how the author interpreted it.
3. Don't supply an explanation.
4. In the report, say what evidence would settle it, if that's useful.
