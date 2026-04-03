import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { supabase } from "@/lib/supabase";

// 매일 아침 8:30 KST — 시장 데이터 수집
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // 보유 종목 + 관심 종목 코드 조회
    const { data: holdings } = await supabase
      .from("portfolio")
      .select("stock_code, stock_name")
      .eq("agent_id", "gildong-v1");

    const watchlist = [
      { stock_code: "005930", stock_name: "삼성전자" },
      { stock_code: "000660", stock_name: "SK하이닉스" },
      { stock_code: "035720", stock_name: "카카오" },
      { stock_code: "373220", stock_name: "LG에너지솔루션" },
      { stock_code: "005380", stock_name: "현대차" },
    ];

    // 보유 종목 + 관심 종목 합치기 (중복 제거)
    const allStocks = new Map<string, string>();
    for (const s of [...(holdings ?? []), ...watchlist]) {
      allStocks.set(s.stock_code, s.stock_name);
    }

    // 주가 데이터 수집 (KRX 공공데이터 또는 한국투자증권 API)
    // TODO: 실제 API 연동 — 현재는 플레이스홀더
    const marketDataRows: Array<Record<string, unknown>> = [];
    allStocks.forEach((name, code) => {
      marketDataRows.push({
        date: today,
        stock_code: code,
        stock_name: name,
        open_price: 0,
        close_price: 0,
        high_price: 0,
        low_price: 0,
        volume: 0,
        change_rate: 0,
        news_summary: "",
      });
    });

    // Supabase에 저장
    const { error } = await supabase.from("market_data").upsert(marketDataRows, {
      onConflict: "date,stock_code",
    });

    if (error) {
      console.error("[Collect] DB error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      collected: marketDataRows.length,
      date: today,
    });
  } catch (err) {
    console.error("[Collect] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
