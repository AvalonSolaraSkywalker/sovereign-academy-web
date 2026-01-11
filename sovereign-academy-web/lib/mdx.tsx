// src/lib/mdx.tsx
import { promises as fs } from 'fs';               // ✅ correct import for Node's promise API
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';   // safe highlighter (no internal rehype‑raw)
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Pluggable } from 'unified';

/* -------------------------------------------------
   1️⃣ Allowed HTML schema (used by rehype‑sanitize)
   ------------------------------------------------- */
const allowedSchema = {
  ...defaultSchema,
  tagNames: [
    // Text‑level semantics
    'a','abbr','b','strong','i','em','cite','code','dfn','kbd','mark','q','s','samp','small','span','sub','sup','u','var',
    // Structural / grouping
    'div','p','blockquote','hr','pre','section','article','aside','header','footer','nav','main',
    // Lists
    'ul','ol','li','dl','dt','dd',
    // Tables
    'table','thead','tbody','tfoot','tr','th','td',
    // Media
    'img','svg','picture','source','audio','video','track','iframe',
    // Forms (rarely needed but harmless)
    'form','input','textarea','button','select','option','optgroup','label','fieldset','legend',
    // Miscellaneous
    'br','wbr','details','summary','dialog','canvas','meter','progress','time','output',
    // Deprecated / legacy (kept for backwards compatibility)
    'center','font',
  ],
  attributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    iframe: ['src', 'allow', 'allowfullscreen', 'width', 'height'],
    svg: ['viewBox', 'xmlns'],
    '*': [
      'class',
      'style',
      'id',
      'title',
      'role',
      'aria-label',
      'aria-hidden',
    ],
  },
  // We already let `rehype‑raw` keep the raw nodes we care about,
  // so we can safely enable this flag.
  allowDangerousHtml: true,
};

/* -------------------------------------------------
   2️⃣ Front‑matter type (extend as you need)
   ------------------------------------------------- */
export interface FrontMatter {
  title: string;
  description?: string;
  date?: string;
  // add any other fields you want to type‑check
}

/* -------------------------------------------------
   3️⃣ Core MDX pipeline (shared by both helpers)
   ------------------------------------------------- */
const mdxPipeline = {
  // -----------------------------------------------------------------
  // Remark plugins (run on the raw markdown / MDX source)
  // -----------------------------------------------------------------
  remarkPlugins: [
    remarkParse,
    remarkGfm,
    remarkMdx,
  ],

  // -----------------------------------------------------------------
  // Rehype plugins (run on the HTML AST after remark → rehype)
  // -----------------------------------------------------------------
  rehypePlugins: [
    // -------------------------------------------------
    // 0️⃣ rehype‑raw – MUST be first, with a passThrough list for MDX nodes
    // -------------------------------------------------
    [
      rehypeRaw,
      {
        // All MDX node types that should be left untouched.
        passThrough: [
          'mdxJsxFlowElement',
          'mdxJsxTextElement',
          'mdxJsxAttribute',
          'mdxJsxExpressionAttribute',
          'mdxJsxFragment',
          'mdxJsxTag',
          // ← NEW: expression nodes that also appear in MDX
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

    // -------------------------------------------------
    // 5️⃣ Sanitize the final HTML according to our whitelist
    // -------------------------------------------------
    [rehypeSanitize, allowedSchema],
  ] as Pluggable[],
};

/* -------------------------------------------------
   4️⃣ getMdxContent – reads a file from `content/`,
       parses front‑matter, and returns the serialized MDX.
   ------------------------------------------------- */
export async function getMdxContent(
  slug: string,
): Promise<{ source: MDXRemoteSerializeResult; frontMatter: FrontMatter }> {
  const filePath = path.join(process.cwd(), 'content', `${slug}.mdx`);
  const raw = await fs.readFile(filePath, 'utf8');

  // Split front‑matter from the actual markdown body
  const { data, content } = matter(raw);
  const frontMatter = data as FrontMatter;

  const source = await serialize(content, {
    // Let `next-mdx-remote` also expose the front‑matter (we already have it)
    parseFrontmatter: true,
    mdxOptions: mdxPipeline,
  });

  return { source, frontMatter };
}

/* -------------------------------------------------
   5️⃣ getMdxSource – convenience helper when you already
       have a markdown string (e.g. fetched from an API).
   ------------------------------------------------- */
export async function getMdxSource(
  sourceString: string,
  extraScope: Record<string, unknown> = {},
): Promise<MDXRemoteSerializeResult> {
  return await serialize(sourceString, {
    parseFrontmatter: false,
    mdxOptions: mdxPipeline,
    // Anything you pass here will be available inside the MDX as a variable.
    scope: extraScope,
  });
}