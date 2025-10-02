import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

/**
 * Reads a markdown file, parses optional front‑matter,
 * and returns the serialized MDX source for `MDXRemote`.
 *
 * @param relativePath – path relative to the repo root, e.g. 'content/about.md'
 */
export async function getMdxContent(relativePath: string) {
  const fullPath = path.join(process.cwd(), relativePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { content, data } = matter(fileContents);
  const mdxSource = await serialize(content, { scope: data });
  return { mdxSource, frontMatter: data };
}
