"use client";

import { useState, useEffect } from "react";
import AgentProfile from "@/components/AgentProfile";
import FilterTabs from "@/components/FilterTabs";
import PostCard from "@/components/PostCard";
import TriggerButton from "@/components/TriggerButton";
import { Post, PostType } from "@/lib/types";
import { getPosts } from "@/lib/data";

export default function FeedPage() {
  const [filter, setFilter] = useState<PostType | "all">("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPosts(filter).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, [filter]);

  return (
    <>
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold">gildong.ai</h1>
        <p className="text-sm text-gray-400 mt-1">투명한 투자 에이전트</p>
      </header>

      <AgentProfile />

      <TriggerButton />

      <FilterTabs current={filter} onChange={(key) => setFilter(key as PostType | "all")} />

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">불러오는 중...</p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {posts.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-12">
              해당 타입의 콘텐츠가 없습니다.
            </p>
          )}
        </>
      )}
    </>
  );
}
