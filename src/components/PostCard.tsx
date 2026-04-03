import Link from "next/link";
import { Post } from "@/lib/types";

const typeLabels: Record<string, string> = {
  morning: "아침 한마디",
  trade: "매매",
  weekly: "주간 리뷰",
};

export default function PostCard({ post }: { post: Post }) {
  const date = new Date(post.published_at);
  const dateStr = `${date.getMonth() + 1}월 ${date.getDate()}일`;

  return (
    <Link href={`/feed/${post.id}`}>
      <article className="border border-gray-100 rounded-lg p-5 hover:border-gray-300 transition-colors cursor-pointer">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span className="bg-gray-50 px-2 py-0.5 rounded">
            {typeLabels[post.type]}
          </span>
          <span>{dateStr}</span>
        </div>
        <h3 className="font-bold text-base mb-2">{post.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{post.summary}</p>
      </article>
    </Link>
  );
}
