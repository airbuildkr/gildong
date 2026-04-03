import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { supabase } from "@/lib/supabase";
import { callClaude } from "@/lib/claude";
import {
  GILDONG_SYSTEM_PROMPT,
  MORNING_PROMPT,
  TRADE_PROMPT,
} from "@/lib/agent-prompt";
import { sendTelegramMessage } from "@/lib/telegram";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gildong.ai";

// 매일 아침 9:10 KST — 콘텐츠 생성 + 발행
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // 오늘의 판단 결과 조회
    const { data: todayDecision } = await supabase
      .from("decisions")
      .select("*")
      .eq("agent_id", "gildong-v1")
      .eq("date", today)
      .single();

    // 현재 포트폴리오 조회
    const { data: holdings } = await supabase
      .from("portfolio")
      .select("*")
      .eq("agent_id", "gildong-v1");

    const { data: marketData } = await supabase
      .from("market_data")
      .select("*")
      .eq("date", today);

    const context = `
## 오늘의 판단
행동: ${todayDecision?.action ?? "없음"}
${todayDecision?.stock_name ? `종목: ${todayDecision.stock_name}` : ""}
${todayDecision?.quantity ? `수량: ${todayDecision.quantity}주` : ""}
${todayDecision?.price ? `가격: ${todayDecision.price}원` : ""}
확신도: ${todayDecision?.confidence ?? "N/A"}
이유: ${todayDecision?.reasoning ?? "N/A"}

## 현재 보유 종목
${(holdings ?? []).map((h) => `- ${h.stock_name}: ${h.quantity}주 (수익률 ${h.profit_rate}%)`).join("\n") || "없음"}

## 시장 데이터
${(marketData ?? []).map((m) => `- ${m.stock_name}: 종가 ${m.close_price}원, 등락 ${m.change_rate}%`).join("\n") || "없음"}
`;

    const publishedPosts = [];

    // 1. 아침 한마디 (매일)
    const morningResponse = await callClaude(GILDONG_SYSTEM_PROMPT, [
      { role: "user", content: context + "\n\n" + MORNING_PROMPT },
    ]);
    const morning = JSON.parse(morningResponse);
    const { data: morningPost } = await supabase
      .from("posts")
      .insert({
        agent_id: "gildong-v1",
        type: "morning",
        title: morning.title,
        content: morning.content,
        summary: morning.summary,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (morningPost) {
      publishedPosts.push(morningPost);
      await sendTelegramMessage(
        `☀️ <b>아침 한마디</b>\n${morning.title}\n\n${morning.summary}\n\n👉 ${SITE_URL}/feed/${morningPost.id}`
      );
    }

    // 2. 매매 콘텐츠 (매매가 있을 때만)
    if (todayDecision && todayDecision.action !== "hold") {
      const tradeResponse = await callClaude(GILDONG_SYSTEM_PROMPT, [
        { role: "user", content: context + "\n\n" + TRADE_PROMPT },
      ]);
      const trade = JSON.parse(tradeResponse);
      const { data: tradePost } = await supabase
        .from("posts")
        .insert({
          agent_id: "gildong-v1",
          type: "trade",
          title: trade.title,
          content: trade.content,
          summary: trade.summary,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (tradePost) {
        publishedPosts.push(tradePost);
        const emoji = todayDecision.action === "buy" ? "🔴" : "🟢";
        await sendTelegramMessage(
          `${emoji} <b>매매</b>\n${trade.title}\n\n${trade.summary}\n\n👉 ${SITE_URL}/feed/${tradePost.id}`
        );
      }
    }

    return NextResponse.json({
      ok: true,
      published: publishedPosts.length,
      posts: publishedPosts.map((p) => ({ id: p.id, type: p.type, title: p.title })),
    });
  } catch (err) {
    console.error("[Publish] Error:", err);

    // 데이터 수집 실패 시 자동 콘텐츠 생성
    if (err instanceof Error && err.message.includes("Claude API")) {
      const { data: fallbackPost } = await supabase
        .from("posts")
        .insert({
          agent_id: "gildong-v1",
          type: "morning",
          title: "오늘은 판단을 보류합니다",
          content:
            "오늘은 데이터 수집에 문제가 있어 판단을 보류합니다. 확신 없으면 쉬는 게 맞습니다. 내일 다시 시장을 살펴보겠습니다.",
          summary: "데이터 수집 문제로 오늘은 관망합니다.",
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (fallbackPost) {
        await sendTelegramMessage(
          `☀️ <b>아침 한마디</b>\n오늘은 판단을 보류합니다\n\n데이터 수집 문제로 오늘은 관망합니다.\n\n👉 ${SITE_URL}/feed/${fallbackPost.id}`
        );
      }
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
