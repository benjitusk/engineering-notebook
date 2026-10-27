## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Editing in the browser

With the dev server running, `/__edit` opens a live-preview editor for any project (`/__edit/projects/<slug>`).
It's the `astro-mdx-editor` integration, loaded from a sibling checkout (`../astro-mdx-editor`) only when that
folder exists, so CI and other machines build without it. It saves the `.mdx` file exactly as typed. New projects made from `/__edit` start as drafts dated today (`newEntry` in `astro.config.mjs`); its Commit button commits only the open file and the images it adds, and never pushes. The editor
renders inside `src/mdx-editor/Shell.astro`, which wraps it in the real `BlogPost` layout (`editing` mode, where
the title edits the frontmatter in place). Pasted or dropped images are saved to `src/assets/projects/<slug>/`
and inserted as an import plus a `<Figure>`; the snippet is in `astro.config.mjs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
