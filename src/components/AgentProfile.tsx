"use client";

import { useEffect, useState } from "react";
import { getAgent, getPortfolioSummary } from "@/lib/data";

export default function AgentProfile() {
  const [name, setName] = useState("길동 v1");
  const [description, setDescription] = useState("확신 없으면 쉽니다");
  const [profitRate, setProfitRate] = useState(0);
  const [days, setDays] = useState(0);

  useEffect(() => {
    Promise.all([getAgent(), getPortfolioSummary()]).then(
      ([agentData, summary]) => {
        setName(agentData.name);
        setDescription(agentData.description);
        setProfitRate(summary.profitRate);
        setDays(summary.days);
      }
    );
  }, []);

  const isProfit = profitRate >= 0;

  return (
    <div className="border border-gray-100 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-gray-500 text-sm mt-1">&ldquo;{description}&rdquo;</p>
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
