import { NextRequest, NextResponse } from "next/server";

// 수동 트리거: collect → decide → publish 순차 실행
export async function POST(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const authHeader = req.headers.get("authorization") || "";

  const results: Record<string, unknown> = {};
  const steps = ["collect", "decide", "publish"];

  for (const step of steps) {
    try {
      const res = await fetch(`${baseUrl}/api/cron/${step}`, {
        headers: { authorization: authHeader },
      });
      const data = await res.json();
      results[step] = { status: res.status, ...data };

      if (!res.ok) {
        results[step] = { status: res.status, error: data.error || "Failed" };
        // collect 실패해도 나머지 시도
        if (step === "decide") break;
      }
    } catch (err) {
      results[step] = {
        status: 500,
        error: err instanceof Error ? err.message : "Unknown error",
      };
      if (step === "decide") break;
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    results,
  });
}
