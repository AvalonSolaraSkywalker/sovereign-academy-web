   //* -------------------------------------------------------------
  //  MDX utilities for the Sovereign Academy site
  // ------------------------------------------------------------- *//

// frontend/src/lib/mdx.ts

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Pluggable } from 'unified';

const allowedSchema = {
   ...defaultSchema,
     tagNames: [
     'a',
     'p',
     'strong',
     'em',
     'ul',
     'ol',
     'li',
     'blockquote',
     'iframe',
     'svg',
   ],
   attributes: {
     a: ['href', 'title', 'target', 'rel'],
     iframe: ['src', 'allow', 'allowfullscreen', 'width', 'height'],
     svg: ['viewBox', 'xmlns'],
   },
   allowDangerousHtml: true,
 };

/* -------------------------------------------------------------
   2️⃣ Front‑matter shape – extend if you want stricter typing.
   ------------------------------------------------------------- */
export type FrontMatter = Record<string, unknown>;

/* -------------------------------------------------------------
   3️⃣ Helper that reads a *.mdx* file from the `content/` folder,
   parses its front‑matter, and returns both the serialized MDX
   result and the front‑matter object.
   ------------------------------------------------------------- */
export async function getMdxContent(
  slug: string,
): Promise<{ source: MDXRemoteSerializeResult; frontMatter: FrontMatter }> {
  const filePath = path.join(process.cwd(), 'content', `${slug}.mdx`);
  const raw = await fs.readFile(filePath, 'utf8');

  const { data, content } = matter(raw);
  const frontMatter: FrontMatter = data as FrontMatter;

  const source = await serialize(content, {
    parseFrontmatter: true,
    // ──────── MDX‑SPECIFIC OPTIONS ────────
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeRaw,

        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypePrism,

        [rehypeSanitize, allowedSchema],
      ] as Pluggable[],
    },
  } as any); // casting to any silences TS‑missing‑format typings

  return { source, frontMatter };
}

/* -------------------------------------------------------------
   4️⃣ Convenience wrapper – if you already have a markdown string
   (e.g. fetched from an API) and just need the MDX result, call
   this directly.
   ------------------------------------------------------------- */
export async function getMdxSource(
  sourceString: string,
  extraScope: FrontMatter = {},
): Promise<MDXRemoteSerializeResult> {
  return await serialize(sourceString, {
    parseFrontmatter: false,
    // mdxOptions are identical to the ones above
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeRaw,
        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypePrism,
        // [rehypeSanitize, allowedSchema],
      ] as Pluggable[],
    },
    // Any extra variables you want available inside the MDX.
    scope: extraScope,
  } as any);
}
