import type { APIRoute, GetStaticPaths } from 'astro';
import { type CollectionEntry, getCollection } from 'astro:content';
import { renderHero } from '../../../lib/hero/index.js';
import { LIGHT } from '../../../lib/hero/palette.js';
import { renderPostCard } from '../../../lib/og/post-card.js';

/**
 * Share cards for project posts, at /og/projects/<slug>.png: the post's hero
 * framed on notebook paper (see src/lib/og/post-card.js). This route takes
 * priority over the catch-all text cards in ../[...route].ts.
 */
export const getStaticPaths = (async () => {
    const posts = await getCollection('projects');
    return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

type Props = { post: CollectionEntry<'projects'> };

export const GET: APIRoute<Props> = async ({ props }) => {
    const { id, data } = props.post;
    // Content-collection images carry their source file path.
    const heroImagePath = data.heroImage ? (data.heroImage as { fsPath?: string }).fsPath : undefined;
    const heroSvg = heroImagePath ? undefined : renderHero({ ...data, slug: id }, { palette: LIGHT }).svg;
    const png = await renderPostCard({ title: data.title, heroSvg, heroImagePath });
    return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
