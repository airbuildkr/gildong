import { agent, getTotalProfitRate, getDaysSinceStart } from "@/lib/mock-data";

export default function AgentProfile() {
  const profitRate = getTotalProfitRate();
  const days = getDaysSinceStart();
  const isProfit = profitRate >= 0;

  return (
    <div className="border border-gray-100 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-bold">{agent.name}</h2>
      <p className="text-gray-500 text-sm mt-1">&ldquo;{agent.description}&rdquo;</p>
      <p className="text-sm text-gray-400 mt-3">
        운용 {days}일째 · 수익률{" "}
        <span className={isProfit ? "text-profit font-bold" : "text-loss font-bold"}>
          {isProfit ? "+" : ""}
          {profitRate.toFixed(1)}%
        </span>
      </p>
    </div>
  );
}
