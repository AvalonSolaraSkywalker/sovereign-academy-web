// frontend/src/app/about/page.tsx

import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getMdxContent } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about the Sovereign Academy.",
};

export default async function AboutPage() {
  // getMdxContent now returns the MDXRemoteSerializeResult directly
  const mdxSource = await getMdxContent("content/about.md");

  return (
    <article className="prose lg:prose-lg mx-auto p-4">
      {/* Spread the result into MDXRemote */}
      <MDXRemote {...mdxSource} />
    </article>
  );
}
