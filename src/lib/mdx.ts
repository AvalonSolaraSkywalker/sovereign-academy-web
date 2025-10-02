import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

export async function getMdxContent(relativePath: string) {
  const fullPath = path.join(process.cwd(), relativePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { content, data } = matter(fileContents);
  const mdxSource = await serialize(content, { scope: data });
  return { mdxSource, frontMatter: data };
}
