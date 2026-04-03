import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold mb-2">gildong.ai</h1>
      <p className="text-gray-400 text-sm mb-8">페이지를 찾을 수 없습니다</p>
      <Link
        href="/"
        className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
      >
        피드로 돌아가기
      </Link>
    </div>
  );
}
