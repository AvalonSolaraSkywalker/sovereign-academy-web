// src/lib/mdxHelper.ts
import { promises as fs } from 'fs';               // ✅ correct import for Node's promise API
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';   // safe highlighter – no internal rehype‑raw
import rehypeRaw from 'rehype-raw';               // our own raw‑HTML handler
import type { FrontMatter } from '@/types/frontmatter';

/* -------------------------------------------------
   Types – what the consumer (your page) will receive
   ------------------------------------------------- */
export interface MDXRemoteResult {
  source: MDXRemoteSerializeResult;
  frontmatter?: FrontMatter;
}

/* -------------------------------------------------
   Main helper – reads a .mdx file, parses it, and returns
   a shape ready for `next‑mdx‑remote`.
   ------------------------------------------------- */
export async function getMdxContent(
  slug: string // e.g. 'about' or 'about.es'
): Promise<MDXRemoteResult> {
  const filePath = path.join(process.cwd(), 'content', `${slug}.mdx`);
  const raw = await fs.readFile(filePath, 'utf8');

  const serialized: MDXRemoteSerializeResult = await serialize(raw, {
    parseFrontmatter: true,
    mdxOptions: {
      // -------------------------------------------------
      // Remark plugins (run on the markdown/MDX source)
      // -------------------------------------------------
      remarkPlugins: [
        remarkParse,
        remarkGfm,
        remarkFrontmatter,
        remarkMdx,
      ],

      // -------------------------------------------------
      // Rehype plugins (run on the HTML AST after remark → rehype)
      // -------------------------------------------------
      rehypePlugins: [
        // -------------------------------------------------
        // 0️⃣ rehype‑raw – MUST be FIRST, with a full passThrough list
        // -------------------------------------------------
        [
          rehypeRaw,
          {
            // All MDX node types that should be left untouched.
            // This list covers JSX elements **and** the expression nodes
            // that appear when you write `{someVariable}` inside MDX.
            passThrough: [
              'mdxJsxFlowElement',
              'mdxJsxTextElement',
              'mdxJsxAttribute',
              'mdxJsxExpressionAttribute',
              'mdxJsxFragment',
              'mdxJsxTag',
              // NEW – expression nodes that also appear in MDX
              'mdxFlowExpression',
              'mdxTextExpression',
            ],
          },
        ],

        // -------------------------------------------------
        // 1️⃣ Convert mdast → hast (no dangerous HTML)
        // -------------------------------------------------
        remarkRehype,

        // -------------------------------------------------
        // 2️⃣ Add IDs to headings (so we can link to them)
        // -------------------------------------------------
        rehypeSlug,

        // -------------------------------------------------
        // 3️⃣ Autolink headings (wrap them in <a>)
        // -------------------------------------------------
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'wrap',
            properties: { className: ['anchor'] },
          },
        ],

        // -------------------------------------------------
        // 4️⃣ Syntax highlighting (highlight.js)
        // -------------------------------------------------
        rehypeHighlight,
      ],
    },
  });

  return {
    source: serialized,
    frontmatter: serialized.frontmatter as FrontMatter | undefined,
  };
}