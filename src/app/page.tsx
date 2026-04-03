"use client";

import { useState } from "react";
import AgentProfile from "@/components/AgentProfile";
import FilterTabs from "@/components/FilterTabs";
import PostCard from "@/components/PostCard";
import { getFilteredPosts } from "@/lib/mock-data";

export default function FeedPage() {
  const [filter, setFilter] = useState("all");
  const posts = getFilteredPosts(filter);

  return (
    <>
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold">gildong.ai</h1>
        <p className="text-sm text-gray-400 mt-1">투명한 투자 에이전트</p>
      </header>

      <AgentProfile />

      <FilterTabs current={filter} onChange={setFilter} />

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
  );
}
