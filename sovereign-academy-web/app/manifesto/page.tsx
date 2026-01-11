// frontend/src/app/manifesto/page.tsx
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { getMdxContent } from '@/src/lib/mdx';

export const metadata: Metadata = {
  title: 'Sovereignty Manifesto – Sovereign Academy',
  description:
    'Our vision of privacy, self‑ownership, financial independence, and digital rights.',
  openGraph: {
    title: 'Sovereignty Manifesto',
    description: 'Discover the principles that drive Sovereign Academy.',
    url: '/manifesto',
    images: [{ url: '/og-manifesto.png', width: 1200, height: 630 }],
  },
};

export default async function ManifestoPage() {
  // `getMdxContent` should return an object that contains the MDX source.
  const { source } = await getMdxContent('content/manifesto.mdx');

  return (
    <article className="prose lg:prose-lg mx-auto p-4">
      <MDXRemote source={source} />
    </article>
  );
}
