"use client";

import { useState } from "react";

interface StockData {
  stock_name: string;
  stock_code: string;
  close_price: number;
  change_rate: number;
  market: string;
  news?: string;
  priceInKRW?: number;
}

interface TestResult {
  ok: boolean;
  timestamp: string;
  exchangeRate: number;
  stocks: {
    KR: StockData[];
    US: StockData[];
  };
  totalStocks: number;
}

export default function TriggerButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/test/stocks");
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "데이터를 가져올 수 없습니다");
        return;
      }

      setResult(data);
    } catch {
      setError("서버에 연결할 수 없습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <button
        onClick={handleTest}
        disabled={loading}
        className="w-full py-3 rounded-lg text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? "데이터 수집 중..." : "지금 시장 데이터 가져오기"}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-loss">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 border border-gray-100 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-gray-400">
              {new Date(result.timestamp).toLocaleString("ko-KR")} 기준
            </p>
            <p className="text-xs text-gray-400">
              환율: 1$ = {result.exchangeRate.toLocaleString()}원
            </p>
          </div>

          {/* 한국 */}
          <h3 className="text-sm font-bold mb-2">한국</h3>
          <div className="flex flex-col gap-1.5 mb-4">
            {result.stocks.KR.map((s) => (
              <div
                key={s.stock_code}
                className="flex justify-between items-center text-sm"
              >
                <span>{s.stock_name}</span>
                <div className="flex items-center gap-2">
                  <span>{s.close_price.toLocaleString()}원</span>
                  <span
                    className={`text-xs font-medium ${
                      s.change_rate >= 0 ? "text-profit" : "text-loss"
                    }`}
                  >
                    {s.change_rate >= 0 ? "+" : ""}
                    {s.change_rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 미국 */}
          <h3 className="text-sm font-bold mb-2">미국</h3>
          <div className="flex flex-col gap-1.5">
            {result.stocks.US.map((s) => (
              <div
                key={s.stock_code}
                className="flex justify-between items-center text-sm"
              >
                <span>
                  {s.stock_name}{" "}
                  <span className="text-xs text-gray-400">{s.stock_code}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span>${s.close_price.toLocaleString()}</span>
                  <span
                    className={`text-xs font-medium ${
                      s.change_rate >= 0 ? "text-profit" : "text-loss"
                    }`}
                  >
                    {s.change_rate >= 0 ? "+" : ""}
                    {s.change_rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {result.stocks.KR.length === 0 && result.stocks.US.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              시장이 닫혀 있거나 데이터를 가져올 수 없습니다
            </p>
          )}
        </div>
      )}
    </div>
  );
}
