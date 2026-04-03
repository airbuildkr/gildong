import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getPosts } from "@/lib/data";
import MarkdownContent from "@/components/MarkdownContent";

const typeLabels: Record<string, string> = {
  morning: "아침 한마디",
  trade: "매매",
  weekly: "주간 리뷰",
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ id: post.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await getPost(params.id);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  const date = new Date(post.published_at);
  const dateStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

  return (
    <>
      <Link
        href="/"
        className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
      >
        &larr; 피드로 돌아가기
      </Link>

      <article className="mt-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="bg-gray-50 px-2 py-0.5 rounded">
            {typeLabels[post.type]}
          </span>
          <span>{dateStr}</span>
        </div>

        <h1 className="text-2xl font-bold mb-6">{post.title}</h1>

        <MarkdownContent content={post.content} />
      </article>
    </>
  );
}
