// frontend/src/lib/mdx.ts

import { promises as fs } from 'node:fs';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import { unified } from 'unified';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

export interface BaseFrontMatter {
  title?: string;
  date?: string;
  description?: string;
  [key: string]: unknown;
}

export type MdxPayload<T extends Record<string, unknown> = BaseFrontMatter> = {
  mdxSource: MDXRemoteSerializeResult;
  frontMatter: T;
};

export async function getMdxContent<
  T extends Record<string, unknown> = BaseFrontMatter
>(path: string, opts?: Record<string, unknown>): Promise<MdxPayload<T>> {
  const raw = await fs.readFile(path, 'utf8');

  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify);

  const file = await processor.process(raw);
  const html = file.toString();

  const serializeOpts = {
    parseFrontMatter: true,
    ...(opts ?? {})
  };

  const mdxSource = await serialize(html, serializeOpts as any);
  const frontMatter = (mdxSource?.frontmatter ?? {}) as T;

  return { mdxSource, frontMatter };
}
