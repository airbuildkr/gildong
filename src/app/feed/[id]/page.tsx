import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, posts } from "@/lib/mock-data";

const typeLabels: Record<string, string> = {
  morning: "아침 한마디",
  trade: "매매",
  weekly: "주간 리뷰",
};

export function generateStaticParams() {
  return posts.map((post) => ({ id: post.id }));
}

export default function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const post = getPost(params.id);

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

        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {post.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="text-lg font-bold mt-8 mb-3 text-gray-900">
                  {line.replace("## ", "")}
                </h2>
              );
            }
            if (line.startsWith("| ")) {
              return (
                <p key={i} className="font-mono text-xs text-gray-500">
                  {line}
                </p>
              );
            }
            if (line.startsWith("- **")) {
              const parts = line.replace("- **", "").split("**");
              return (
                <p key={i} className="ml-2 mb-1">
                  <strong>{parts[0]}</strong>
                  {parts.slice(1).join("")}
                </p>
              );
            }
            if (line.match(/^\*\*.+\*\*$/)) {
              return (
                <p key={i} className="font-bold mt-4 mb-1 text-gray-900">
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.match(/^\*\*.+\*\*/)) {
              const match = line.match(/^\*\*(.+?)\*\*(.*)$/);
              if (match) {
                return (
                  <p key={i} className="mt-3">
                    <strong>{match[1]}</strong>
                    {match[2]}
                  </p>
                );
              }
            }
            if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
              return (
                <p key={i} className="ml-4 mb-1 text-gray-600">
                  {line}
                </p>
              );
            }
            if (line.trim() === "") return <br key={i} />;
            return <p key={i}>{line}</p>;
          })}
        </div>
      </article>
    </>
  );
}
