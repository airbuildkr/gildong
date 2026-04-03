import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { supabase } from "@/lib/supabase";
import { callClaude } from "@/lib/claude";
import { GILDONG_SYSTEM_PROMPT, WEEKLY_PROMPT } from "@/lib/agent-prompt";
import { sendTelegramMessage } from "@/lib/telegram";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gildong.ai";

// 매주 일요일 오전 — 주간 리뷰
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 이번 주 매매 기록 조회
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const [{ data: weekTrades }, { data: holdings }, { data: cashData }, { data: agentData }] =
      await Promise.all([
        supabase
          .from("trade_history")
          .select("*")
          .eq("agent_id", "gildong-v1")
          .gte("date", weekAgoStr)
          .order("date", { ascending: true }),
        supabase
          .from("portfolio")
          .select("*")
          .eq("agent_id", "gildong-v1"),
        supabase
          .from("cash")
          .select("*")
          .eq("agent_id", "gildong-v1")
          .single(),
        supabase
          .from("agents")
          .select("*")
          .eq("id", "gildong-v1")
          .single(),
      ]);

    const stockValue = (holdings ?? []).reduce(
      (sum, h) => sum + h.current_price * h.quantity,
      0
    );
    const totalValue = stockValue + (cashData?.balance ?? 0);
    const initialCapital = agentData?.initial_capital ?? 10000000;
    const totalProfitRate = (
      ((totalValue - initialCapital) / initialCapital) *
      100
    ).toFixed(1);

    const startDate = new Date(agentData?.created_at ?? now);
    const weekNumber = Math.ceil(
      (now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    const context = `
## 주간 리뷰 정보
현재 ${weekNumber}주차입니다.
누적 수익률: ${totalProfitRate}%
총 평가금액: ${totalValue.toLocaleString()}원
현금: ${(cashData?.balance ?? 0).toLocaleString()}원

## 이번 주 매매 기록
${
  (weekTrades ?? []).length > 0
    ? (weekTrades ?? [])
        .map(
          (t) =>
            `- ${t.date} | ${t.stock_name} | ${t.action === "buy" ? "매수" : "매도"} ${t.quantity}주 @${t.price}원 | ${t.profit_loss !== null ? `수익률 ${t.profit_loss}%` : "진행중"}`
        )
        .join("\n")
    : "이번 주 매매 없음"
}

## 현재 보유 종목
${(holdings ?? []).map((h) => `- ${h.stock_name}: ${h.quantity}주, 수익률 ${h.profit_rate}%`).join("\n") || "없음"}
`;

    const response = await callClaude(GILDONG_SYSTEM_PROMPT, [
      { role: "user", content: context + "\n\n" + WEEKLY_PROMPT },
    ]);

    const weekly = JSON.parse(response);

    const { data: post } = await supabase
      .from("posts")
      .insert({
        agent_id: "gildong-v1",
        type: "weekly",
        title: weekly.title,
        content: weekly.content,
        summary: weekly.summary,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (post) {
      await sendTelegramMessage(
        `📊 <b>주간 리뷰</b>\n${weekly.title}\n\n${weekly.summary}\n\n👉 ${SITE_URL}/feed/${post.id}`
      );
    }

    return NextResponse.json({
      ok: true,
      post: post ? { id: post.id, title: post.title } : null,
    });
  } catch (err) {
    console.error("[Weekly] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
