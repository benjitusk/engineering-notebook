import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { MOTIFS } from './lib/hero/index.js';

const projects = defineCollection({
    // Load Markdown and MDX files in the `src/content/projects/` directory.
    loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
    // Type-check frontmatter using a schema
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            description: z.string(),
            // Transform string to Date object
            pubDate: z.coerce.date(),
            updatedDate: z.coerce.date().optional(),
            heroImage: z.optional(image()),
            /** Generated hero figure, used when there's no heroImage (src/lib/hero).
             *  All optional: the motif comes from tags and the seed from the slug. */
            hero: z
                .object({
                    motif: z.enum(MOTIFS).optional(),
                    seed: z.union([z.string(), z.number()]).optional(),
                    labels: z.array(z.string()).optional(),
                })
                .optional(),

            // --- Project / notebook metadata (all optional) ---
            // Shown by ProjectHeader / MetaTable / Tags on the post page.
            /** Project number, e.g. "07". Drives the "PROJECT / 07" eyebrow. */
            number: z.string().optional(),
            /** One-word status, e.g. "Working prototype", "Abandoned". */
            status: z.string().optional(),
            /** Topic tags rendered as chips. */
            tags: z.array(z.string()).optional(),
            /** Ordered spec rows for the MetaTable, e.g.
             *  { Status: "Working prototype", Platform: "Linux", Language: "Rust" } */
            meta: z.record(z.string(), z.string()).optional(),
            /** Hide from indexes / listings while drafting. */
            draft: z.boolean().optional(),
        }),
});

export const collections = { projects };
