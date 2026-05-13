/**
 * GET handler for the `/<slug>.md` route.
 *
 * Inlined from `starlight-markdown@0.1.5` (MIT, © Reynaldi Chernando)
 * <https://github.com/reynaldichernando/starlight-markdown> with the route
 * pattern updated from `/<slug>/index.md` to `/<slug>.md` to match the
 * `<url>.md` convention adopted by Anthropic, Vercel, Next.js, etc.
 */

import { getCollection, getEntry } from "astro:content";

export async function GET({ params }) {
	const path = params.path;
	if (!path) return new Response("Not found", { status: 404 });
	const doc = await getEntry("docs", path);
	if (!doc) return new Response("Not found", { status: 404 });
	const markdown = `# ${doc.data.title}\n\n` + doc.body;
	return new Response(markdown, {
		headers: { "content-type": "text/markdown; charset=utf-8" },
	});
}

export async function getStaticPaths() {
	const docs = await getCollection("docs");
	return docs.map((doc) => ({ params: { path: doc.id } }));
}
