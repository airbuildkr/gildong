import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { supabase } from "@/lib/supabase";
import { callClaude } from "@/lib/claude";
import { GILDONG_SYSTEM_PROMPT, DECISION_PROMPT } from "@/lib/agent-prompt";

// 매일 아침 9:00 KST — AI 판단 + 포트폴리오 업데이트
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // 현재 포트폴리오 조회
    const [{ data: holdings }, { data: cashData }, { data: marketData }] =
      await Promise.all([
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
          .from("market_data")
          .select("*")
          .eq("date", today),
      ]);

    const portfolioContext = `
## 현재 포트폴리오
현금: ${cashData?.balance?.toLocaleString() ?? 0}원
보유 종목:
${(holdings ?? []).map((h) => `- ${h.stock_name}(${h.stock_code}): ${h.quantity}주, 평균매수가 ${h.avg_price}원, 현재가 ${h.current_price}원`).join("\n") || "없음"}

## 오늘의 시장 데이터
${(marketData ?? []).map((m) => `- ${m.stock_name}(${m.stock_code}): 종가 ${m.close_price}원, 등락률 ${m.change_rate}%, 뉴스: ${m.news_summary || "없음"}`).join("\n") || "데이터 없음"}
`;

    // Claude에 판단 요청
    const response = await callClaude(GILDONG_SYSTEM_PROMPT, [
      { role: "user", content: portfolioContext + "\n\n" + DECISION_PROMPT },
    ]);

    const decision = JSON.parse(response);

    // 판단 결과 저장
    await supabase.from("decisions").insert({
      agent_id: "gildong-v1",
      date: today,
      action: decision.action,
      stock_code: decision.stock_code,
      stock_name: decision.stock_name,
      quantity: decision.quantity,
      price: decision.price,
      confidence: decision.confidence,
      reasoning: decision.reasoning,
    });

    // 매매 실행
    if (decision.action === "buy" && decision.stock_code) {
      const totalCost = decision.price * decision.quantity;

      // 현금 차감
      await supabase
        .from("cash")
        .update({ balance: (cashData?.balance ?? 0) - totalCost, updated_at: new Date().toISOString() })
        .eq("agent_id", "gildong-v1");

      // 기존 보유 확인
      const existing = (holdings ?? []).find(
        (h) => h.stock_code === decision.stock_code
      );

      if (existing) {
        const newQuantity = existing.quantity + decision.quantity;
        const newAvgPrice = Math.round(
          (existing.avg_price * existing.quantity +
            decision.price * decision.quantity) /
            newQuantity
        );
        await supabase
          .from("portfolio")
          .update({
            quantity: newQuantity,
            avg_price: newAvgPrice,
            current_price: decision.price,
            profit_rate: Number(
              (((decision.price - newAvgPrice) / newAvgPrice) * 100).toFixed(2)
            ),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("portfolio").insert({
          agent_id: "gildong-v1",
          stock_code: decision.stock_code,
          stock_name: decision.stock_name,
          quantity: decision.quantity,
          avg_price: decision.price,
          current_price: decision.price,
          profit_rate: 0,
        });
      }

      // 매매 기록
      await supabase.from("trade_history").insert({
        agent_id: "gildong-v1",
        date: today,
        action: "buy",
        stock_code: decision.stock_code,
        stock_name: decision.stock_name,
        quantity: decision.quantity,
        price: decision.price,
        total_amount: totalCost,
        profit_loss: null,
      });
    }

    if (decision.action === "sell" && decision.stock_code) {
      const totalAmount = decision.price * decision.quantity;
      const existing = (holdings ?? []).find(
        (h) => h.stock_code === decision.stock_code
      );

      if (existing) {
        const profitLoss = Number(
          (((decision.price - existing.avg_price) / existing.avg_price) * 100).toFixed(2)
        );
        const remainingQuantity = existing.quantity - decision.quantity;

        if (remainingQuantity <= 0) {
          await supabase.from("portfolio").delete().eq("id", existing.id);
        } else {
          await supabase
            .from("portfolio")
            .update({
              quantity: remainingQuantity,
              current_price: decision.price,
              profit_rate: profitLoss,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        }

        // 현금 증가
        await supabase
          .from("cash")
          .update({ balance: (cashData?.balance ?? 0) + totalAmount, updated_at: new Date().toISOString() })
          .eq("agent_id", "gildong-v1");

        // 매매 기록
        await supabase.from("trade_history").insert({
          agent_id: "gildong-v1",
          date: today,
          action: "sell",
          stock_code: decision.stock_code,
          stock_name: decision.stock_name,
          quantity: decision.quantity,
          price: decision.price,
          total_amount: totalAmount,
          profit_loss: profitLoss,
        });
      }
    }

    return NextResponse.json({ ok: true, decision });
  } catch (err) {
    console.error("[Decide] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
