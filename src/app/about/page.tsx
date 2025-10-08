// frontend/src/app/about/page.tsx
import type { Metadata } from 'next';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getMdxContent } from '@/lib/mdx';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about the Sovereign Academy.',
};

export default async function AboutPage() {
const { source: mdxSource } = await getMdxContent('about');

  return <MDXRemote source={mdxSource} />;
}
