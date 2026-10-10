import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { OG_COLLECTIONS, renderOgPng } from "../../../lib/og-image.mjs";

// T-261010-061: one share image per article, served as /og/<collection>/<id>.png.
export async function getStaticPaths() {
  const paths = [];
  for (const collection of Object.keys(OG_COLLECTIONS)) {
    for (const post of await getCollection(collection as keyof typeof OG_COLLECTIONS)) {
      paths.push({ params: { collection, slug: post.id }, props: { collection, data: post.data } });
    }
  }
  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const { collection, data } = props;
  const png = await renderOgPng({ collection, title: data.title, date: data.date, version: data.version });
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
