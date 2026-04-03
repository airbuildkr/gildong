import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { supabase } from "@/lib/supabase";
import { fetchStockQuotes, DEFAULT_WATCHLIST, toYahooSymbol } from "@/lib/stock-api";
import { collectNewsForStocks } from "@/lib/news";
import { getUsdKrwRate } from "@/lib/exchange-rate";

// 매일 아침 8:30 KST — 시장 데이터 + 뉴스 + 환율 수집
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // 1. 보유 종목 조회
    const { data: holdings } = await supabase
      .from("portfolio")
      .select("id, stock_code, stock_name, market")
      .eq("agent_id", "gildong-v1");

    // 2. 보유 종목 + 관심 종목 합치기 (중복 제거)
    const allStocksMap = new Map<
      string,
      { code: string; name: string; yahoo_symbol: string; market: "KR" | "US" }
    >();

    for (const s of DEFAULT_WATCHLIST) {
      allStocksMap.set(s.code, s);
    }
    for (const h of holdings ?? []) {
      if (!allStocksMap.has(h.stock_code)) {
        const isKR = /^\d{6}$/.test(h.stock_code);
        allStocksMap.set(h.stock_code, {
          code: h.stock_code,
          name: h.stock_name,
          yahoo_symbol: toYahooSymbol(h.stock_code),
          market: isKR ? "KR" : "US",
        });
      }
    }

    const allStocks = Array.from(allStocksMap.values());

    // 3. 주가 시세 + 뉴스 + 환율을 병렬 조회
    const [quotes, newsMap, exchangeRate] = await Promise.all([
      fetchStockQuotes(allStocks),
      collectNewsForStocks(
        allStocks.map((s) => ({ stock_code: s.code, stock_name: s.name }))
      ),
      getUsdKrwRate(),
    ]);

    if (quotes.length === 0) {
      console.warn("[Collect] No quotes fetched");
      return NextResponse.json({
        ok: false,
        error: "No stock quotes fetched",
        date: today,
      });
    }

    // 4. market_data 테이블에 저장
    const marketDataRows = quotes.map((q) => ({
      date: today,
      stock_code: q.stock_code,
      stock_name: q.stock_name,
      market: q.market,
      open_price: q.open_price,
      close_price: q.close_price,
      high_price: q.high_price,
      low_price: q.low_price,
      volume: q.volume,
      change_rate: q.change_rate,
      news_summary: newsMap.get(q.stock_code) || "",
    }));

    const { error: upsertError } = await supabase
      .from("market_data")
      .upsert(marketDataRows, { onConflict: "date,stock_code" });

    if (upsertError) {
      console.error("[Collect] DB upsert error:", upsertError);
    }

    // 5. 보유 종목의 현재가 + 수익률 업데이트
    let updatedHoldings = 0;
    for (const holding of holdings ?? []) {
      const quote = quotes.find((q) => q.stock_code === holding.stock_code);
      if (quote && quote.close_price > 0) {
        const { data: portfolioItem } = await supabase
          .from("portfolio")
          .select("avg_price")
          .eq("id", holding.id)
          .single();

        if (portfolioItem) {
          const profitRate = Number(
            (
              ((quote.close_price - portfolioItem.avg_price) /
                portfolioItem.avg_price) *
              100
            ).toFixed(2)
          );

          await supabase
            .from("portfolio")
            .update({
              current_price: quote.close_price,
              profit_rate: profitRate,
              updated_at: new Date().toISOString(),
            })
            .eq("id", holding.id);

          updatedHoldings++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      date: today,
      collected: quotes.length,
      markets: {
        KR: quotes.filter((q) => q.market === "KR").length,
        US: quotes.filter((q) => q.market === "US").length,
      },
      newsCollected: Array.from(newsMap.values()).filter((v) => v.length > 0).length,
      exchangeRate,
      updatedHoldings,
    });
  } catch (err) {
    console.error("[Collect] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
