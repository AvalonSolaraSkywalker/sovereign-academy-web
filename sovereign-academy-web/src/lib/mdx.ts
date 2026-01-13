/**
 * src/lib/mdx.ts
 *
 * Centralised MDX utilities for the Sovereign Academy UI.
 *
 * Provides:
 *   • Typed loader for MDX files (front‑matter + serialized content)
 *   • Helper to load all MDX files in a directory
 *   • A registry of React components that can be used inside MDX
 *
 * Runtime dependencies (install with pnpm/npm):
 *   remark-slug
 *   remark-autolink-headings
 *
 * Note: Official @types packages for the two remark plugins do not exist,
 * so we supply minimal `declare module` stubs in src/types/remark.d.ts.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import remarkAutolinkHeadings from 'remark-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import React from 'react';

/* Stub declarations */
declare module 'remark-slug' { const remarkSlug: any; export default remarkSlug; }
declare module 'remark-autolink-headings' { const remarkAutolinkHeadings: any; export default remarkAutolinkHeadings; }

/* Types */
export interface MdxFrontMatter {
  title?: string;
  description?: string;
  date?: string;
  tags?: string[];
}
export interface LoadedMdx {
  content: MDXRemoteSerializeResult;
  frontMatter: MdxFrontMatter;
}

/* Component registry */
export const mdxComponents: Record<string, React.ComponentType<any>> = {
  Alert: ({
    type = 'info',
    children,
  }: {
    type?: 'info' | 'warning' | 'error' | 'success';
    children: React.ReactNode;
  }) => {
    const bgClasses: Record<'info' | 'warning' | 'error' | 'success', string> = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
    };
    const bg = bgClasses[type];
    return <div className={`rounded p-4 my-4 ${bg}`}>{children}</div>;
  },
};

/* Core functions */
export async function loadMdxFile(relativePath: string): Promise<LoadedMdx> {
  const absolutePath = path.join(process.cwd(), relativePath);
  const source = await fs.promises.readFile(absolutePath, 'utf8');
  const { data, content } = matter(source);
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkSlug, [remarkAutolinkHeadings, { behavior: 'wrap' }]],
      rehypePlugins: [[rehypeHighlight, { ignoreMissing: true }]],
    },
    scope: data,
  });
  return { content: mdxSource, frontMatter: data as MdxFrontMatter };
}

export async function loadAllMdxInDirectory(
  dir: string
): Promise<Array<{ slug: string; frontMatter: MdxFrontMatter; content: MDXRemoteSerializeResult }>> {
  const absoluteDir = path.join(process.cwd(), dir);
  const filenames = await fs.promises.readdir(absoluteDir);
  const mdxFiles = filenames.filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const loaded = await Promise.all(
    mdxFiles.map(async (filename) => {
      const slug = filename.replace(/\.(mdx?|markdown?)$/, '');
      const { content, frontMatter } = await loadMdxFile(path.join(dir, filename));
      return { slug, frontMatter, content };
    })
  );
  return loaded.sort((a, b) => {
    if (a.frontMatter.date && b.frontMatter.date) {
      return new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime();
    }
    return 0;
  });
}

/* Export */
export default {
  loadMdxFile,
  loadAllMdxInDirectory,
  mdxComponents,
};
