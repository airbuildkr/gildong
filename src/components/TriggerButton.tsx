"use client";

import { useState } from "react";

interface StockData {
  stock_name: string;
  stock_code: string;
  close_price: number;
  change_rate: number;
  market: string;
}

interface TestResult {
  ok: boolean;
  timestamp: string;
  exchangeRate: number;
  stocks: {
    KR: StockData[];
    US: StockData[];
  };
  notable: {
    topGainers: string[];
    topLosers: string[];
  };
  totalStocks: number;
}

export default function TriggerButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

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

  const renderStocks = (stocks: StockData[], isUS: boolean) => {
    const display = showAll ? stocks : stocks.slice(0, 5);
    return display.map((s) => (
      <div
        key={s.stock_code}
        className="flex justify-between items-center text-sm py-1"
      >
        <span className="truncate mr-2">
          {s.stock_name}{" "}
          <span className="text-xs text-gray-400">{s.stock_code}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">
            {isUS ? `$${s.close_price.toLocaleString()}` : `${s.close_price.toLocaleString()}원`}
          </span>
          <span
            className={`text-xs font-medium min-w-[50px] text-right ${
              s.change_rate >= 0 ? "text-profit" : "text-loss"
            }`}
          >
            {s.change_rate >= 0 ? "+" : ""}
            {s.change_rate}%
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="mb-8">
      <button
        onClick={handleTest}
        disabled={loading}
        className="w-full py-3 rounded-lg text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? "60종목 스크리닝 중..." : "지금 시장 데이터 가져오기"}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-loss">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 border border-gray-100 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-gray-400">
              {new Date(result.timestamp).toLocaleString("ko-KR")} · {result.totalStocks}종목
            </p>
            <p className="text-xs text-gray-400">
              1$ = {result.exchangeRate.toLocaleString()}원
            </p>
          </div>

          {/* Notable */}
          {(result.notable.topGainers.length > 0 || result.notable.topLosers.length > 0) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
              {result.notable.topGainers.length > 0 && (
                <p className="text-profit mb-1">
                  급등: {result.notable.topGainers.join(", ")}
                </p>
              )}
              {result.notable.topLosers.length > 0 && (
                <p className="text-loss">
                  급락: {result.notable.topLosers.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* 한국 */}
          <h3 className="text-sm font-bold mb-2">한국 ({result.stocks.KR.length}종목)</h3>
          <div className="flex flex-col mb-4">
            {renderStocks(result.stocks.KR, false)}
          </div>

          {/* 미국 */}
          <h3 className="text-sm font-bold mb-2">미국 ({result.stocks.US.length}종목)</h3>
          <div className="flex flex-col mb-4">
            {renderStocks(result.stocks.US, true)}
          </div>

          {!showAll && result.totalStocks > 10 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-900 py-2"
            >
              전체 {result.totalStocks}종목 보기
            </button>
          )}

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
