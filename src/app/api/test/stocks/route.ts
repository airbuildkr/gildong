import { NextResponse } from "next/server";
import { fetchStockQuotes, DEFAULT_WATCHLIST } from "@/lib/stock-api";
import { getUsdKrwRate } from "@/lib/exchange-rate";
import { collectNewsForStocks } from "@/lib/news";

export const dynamic = "force-dynamic";

// 실시간 주가 + 뉴스 + 환율 테스트 (API 키 불필요)
export async function GET() {
  try {
    const [quotes, exchangeRate, newsMap] = await Promise.all([
      fetchStockQuotes(DEFAULT_WATCHLIST),
      getUsdKrwRate(),
      collectNewsForStocks(
        DEFAULT_WATCHLIST.map((s) => ({ stock_code: s.code, stock_name: s.name }))
      ),
    ]);

    const result = {
      ok: true,
      timestamp: new Date().toISOString(),
      exchangeRate,
      stocks: {
        KR: quotes
          .filter((q) => q.market === "KR")
          .map((q) => ({
            ...q,
            news: newsMap.get(q.stock_code) || "",
          })),
        US: quotes
          .filter((q) => q.market === "US")
          .map((q) => ({
            ...q,
            news: newsMap.get(q.stock_code) || "",
            priceInKRW: Math.round(q.close_price * exchangeRate),
          })),
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
