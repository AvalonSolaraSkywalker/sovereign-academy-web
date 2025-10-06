// frontend/src/lib/mdx.ts
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import remarkAutolinkHeadings from 'remark-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypePrism from 'rehype-prism-plus';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

type FrontMatter = Record<string, unknown>;

export async function getMdxContent(
  slug: string
): Promise<{ source: MDXRemoteSerializeResult; frontMatter: FrontMatter }> {
  const filePath = path.join(process.cwd(), 'content', `${slug}.mdx`);
  const raw = await fs.promises.readFile(filePath, 'utf8');
  const { content, data } = matter(raw);

  const mdxSource = await serialize(content, {
    format: 'mdx',
    mdxOptions: {
      remarkPlugins: [remarkGfm as any, remarkSlug as any, remarkAutolinkHeadings as any],
      rehypePlugins: [rehypeRaw as any, rehypePrism as any],
    },
  });

  return {
    source: mdxSource,
    frontMatter: data,
  };
}
