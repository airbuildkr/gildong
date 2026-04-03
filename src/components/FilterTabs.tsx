"use client";

const tabs = [
  { key: "all", label: "전체" },
  { key: "morning", label: "아침 한마디" },
  { key: "trade", label: "매매" },
  { key: "weekly", label: "주간 리뷰" },
];

interface FilterTabsProps {
  current: string;
  onChange: (key: string) => void;
}

export default function FilterTabs({ current, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
            current === tab.key
              ? "bg-gray-900 text-white"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
