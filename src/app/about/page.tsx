import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote';
import { getMdxContent } from '@/lib/mdx';

export const metadata: Metadata = {
  title: 'About – Sovereign Academy',
};

export default async function AboutPage() {
  const { mdxSource } = await getMdxContent('content/about.md');
  return <MDXRemote {...mdxSource} />;
}
