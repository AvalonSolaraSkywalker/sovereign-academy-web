/** src/lib/mdx.ts */
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { remark } from 'remark';
import { remarkRehype } from 'remark-rehype';
import { unified } from 'unified';

/**
 * Reads a markdown string, extracts front‑matter with gray‑matter,
 * then serialises it for `next-mdx-remote`.
 *
 * @param source   Raw markdown content
 * @returns        An object containing the serialized MDX source and the parsed front‑matter
 */
export async function getMdxContent(
  source: string
): Promise<{
  mdxSource: MDXRemoteSerializeResult;
  frontMatter: Record<string, unknown>;
}> {
  // Parse front‑matter
  const { data, content } = matter(source);

  // Serialize MDX (you can add remark/rehype plugins here)
  const mdxSource = await serialize(content, {
    // You can pass remark/rehype plugins if you need them:
    // remarkPlugins: [remarkGfm],
    // rehypePlugins: [rehypeHighlight],
    // Or keep it empty for a plain pass‑through
  });

  return { mdxSource, frontMatter: data };
}
