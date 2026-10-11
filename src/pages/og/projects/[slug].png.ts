import type { APIRoute, GetStaticPaths } from 'astro';
import { type CollectionEntry, getCollection } from 'astro:content';
import { renderPostArt } from '../../../lib/art/index.js';
import { LIGHT } from '../../../lib/hero/palette.js';
import { renderPostCard } from '../../../lib/og/post-card.js';

/**
 * Share cards for project posts, at /og/projects/<slug>.png: the title beside
 * the post's art (see src/lib/og/post-card.js). This route takes priority over
 * the catch-all text cards in ../[...route].ts.
 */
export const getStaticPaths = (async () => {
    // Drafts get a card in `astro dev` only, matching their pages in ../../projects/[...slug].astro.
    const posts = await getCollection('projects', (post) => import.meta.env.DEV || !post.data.draft);
    return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

type Props = { post: CollectionEntry<'projects'> };

export const GET: APIRoute<Props> = async ({ props }) => {
    const { id, data } = props.post;
    // Content-collection images carry their source file path.
    const heroImagePath = data.heroImage ? (data.heroImage as { fsPath?: string }).fsPath : undefined;
    const art = heroImagePath ? undefined : renderPostArt({ ...data, slug: id }, { palette: LIGHT });
    const png = await renderPostCard({
        title: data.title,
        artSvg: art?.svg,
        fit: art?.kind === 'generated' ? 'contain' : 'cover',
        heroImagePath,
    });
    return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
