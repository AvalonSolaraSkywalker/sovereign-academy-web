// src/lib/mdxHelper.ts
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import type { FrontMatter } from '@/types/frontmatter';

/* -------------------------------------------------
   Types – what the consumer (your page) will receive
   ------------------------------------------------- */
export interface MDXRemoteResult {
  /** Serialized MDX that `MDXRemote` can render */
  source: MDXRemoteSerializeResult;
  /** Optional front‑matter extracted from the file */
  frontmatter?: FrontMatter;
}

/* -------------------------------------------------
   Main helper – reads a .mdx file, parses it, and returns
   a shape ready for `next‑mdx‑remote`.
   ------------------------------------------------- */
export async function getMdxContent(
  slug: string // e.g. 'about' or 'about.es' (matches a file in /content)
): Promise<MDXRemoteResult> {
  // 👉 ALWAYS read from the `content` folder (relative to the repo root)
  const filePath = path.join(process.cwd(), 'content', `${slug}.mdx`);
  const raw = await fs.readFile(filePath, 'utf8');

  /**
   * `serialize` does the heavy lifting:
   *   - Parses the MDX (with the remark plugins we pass)
   *   - Runs the rehype plugins we pass
   *   - Extracts front‑matter when `parseFrontmatter: true`
   *   - Returns a ready‑to‑render object for `MDXRemote`
   */
  const serialized: MDXRemoteSerializeResult = await serialize(raw, {
    // -------------------------------------------------
    // 1️⃣ Parse the YAML front‑matter block at the top
    // -------------------------------------------------
    parseFrontmatter: true,

    // -------------------------------------------------
    // 2️⃣ Configure remark (markdown → mdast) plugins
    // -------------------------------------------------
    mdxOptions: {
      remarkPlugins: [
        remarkParse,        // basic markdown parser
        remarkGfm,         // tables, task lists, strikethrough, etc.
        remarkFrontmatter, // extracts YAML front‑matter into `data`
        remarkMdx,         // enables JSX inside markdown
      ],

      // -------------------------------------------------
      // 3️⃣ Configure rehype (mdast → hast) plugins
      // -------------------------------------------------
      rehypePlugins: [
        // Allow raw HTML inside MDX (needed for any embedded HTML)
        [remarkRehype, { allowDangerousHtml: true }],

        // Add `id` attributes to headings (so we can link to them)
        rehypeSlug,

        // Wrap headings in an <a> so they become clickable anchors
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'wrap',
            properties: { className: ['anchor'] },
          },
        ],

        // Syntax‑highlight code blocks (uses highlight.js under the hood)
        rehypeHighlight,
      ],
    },
  });

  // `serialized` already contains `frontmatter`, `scope`, and the compiled MDX source.
  return {
    source: serialized,
    frontmatter: serialized.frontmatter as FrontMatter | undefined,
  };
}