import { NextResponse } from "next/server";
import { fetchStockQuotes } from "@/lib/stock-api";
import { getUsdKrwRate } from "@/lib/exchange-rate";
import { FULL_UNIVERSE, filterNotableStocks } from "@/lib/screener";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 실시간 60종목 스크리닝 (API 키 불필요)
export async function GET() {
  try {
    const [quotes, exchangeRate] = await Promise.all([
      fetchStockQuotes(FULL_UNIVERSE),
      getUsdKrwRate(),
    ]);

    const notable = filterNotableStocks(quotes);

    const result = {
      ok: true,
      timestamp: new Date().toISOString(),
      exchangeRate,
      stocks: {
        KR: quotes
          .filter((q) => q.market === "KR")
          .sort((a, b) => b.change_rate - a.change_rate),
        US: quotes
          .filter((q) => q.market === "US")
          .sort((a, b) => b.change_rate - a.change_rate),
      },
      notable: {
        topGainers: notable.topGainers.map((q) => `${q.stock_name} ${q.change_rate > 0 ? "+" : ""}${q.change_rate}%`),
        topLosers: notable.topLosers.map((q) => `${q.stock_name} ${q.change_rate}%`),
      },
      totalStocks: quotes.length,
    };

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
