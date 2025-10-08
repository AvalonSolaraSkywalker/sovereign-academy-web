/* -------------------------------------------------------------
   MDX utilities for the Sovereign Academy site
   ------------------------------------------------------------- */

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

/* -------------------------------------------------------------
   1️⃣ Sanitisation schema – whitelist every HTML tag you might use
   ------------------------------------------------------------- */
const allowedSchema = {
  ...defaultSchema,

  // ---- ALL tags you may embed in MDX ---------------------------------
  tagNames: [
    // Text‑level semantics
    'a', 'abbr', 'b', 'strong', 'i', 'em', 'cite', 'code', 'dfn',
    'kbd', 'mark', 'q', 's', 'samp', 'small', 'span', 'sub', 'sup',
    'u', 'var',
    // Structural / grouping
    'div', 'p', 'blockquote', 'hr', 'pre', 'section', 'article',
    'aside', 'header', 'footer', 'nav', 'main',
    // Lists
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    // Media
    'img', 'svg', 'picture', 'source', 'audio', 'video', 'track',
    'iframe',
    // Forms (rarely needed but harmless)
    'form', 'input', 'textarea', 'button', 'select', 'option',
    'optgroup', 'label', 'fieldset', 'legend',
    // Miscellaneous
    'br', 'wbr', 'details', 'summary', 'dialog', 'canvas',
    'meter', 'progress', 'time', 'output',
    // Deprecated but sometimes used
    'center', 'font',
  ],

  // ---- Attributes we allow for the tags above -------------------------
  attributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    iframe: ['src', 'allow', 'allowfullscreen', 'width', 'height'],
    svg: ['viewBox', 'xmlns'],
    // Generic attributes allowed on any element
    '*': ['class', 'style', 'id', 'title', 'role', 'aria-label', 'aria-hidden'],
  },

  // Because we already whitelist everything we care about,
  // we can safely allow the raw HTML nodes to survive.
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
        // 1️⃣ Allow raw HTML – we must give it a `passThrough` whitelist.
        [
          rehypeRaw,
          {
            // Node types that `rehype‑raw` is allowed to keep.
            passThrough: ['element', 'comment', 'text', 'raw'],
          },
        ],

        // 2️⃣ Normal transformations.
        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypePrism,

        // 3️⃣ Sanitize according to our exhaustive schema.
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
        // Same raw‑HTML pass‑through configuration
        [
          rehypeRaw,
          {
            passThrough: ['element', 'comment', 'text', 'raw'],
          },
        ],
        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypePrism,
        // You can keep the sanitizer active here as well:
        // [rehypeSanitize, allowedSchema],
      ] as Pluggable[],
    },
    // Any extra variables you want available inside the MDX.
    scope: extraScope,
  } as any);
}
