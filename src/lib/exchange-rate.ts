// USD/KRW 환율 조회 (한국수출입은행 또는 Yahoo Finance)
export async function getUsdKrwRate(): Promise<number> {
  // 1차: Yahoo Finance에서 USD/KRW 환율 조회
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=USDKRW=X",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      const rate = data?.quoteResponse?.result?.[0]?.regularMarketPrice;
      if (rate && rate > 0) return rate;
    }
  } catch (err) {
    console.warn("[ExchangeRate] Yahoo Finance failed:", err);
  }

  // 2차: 하드코딩 기본값 (최후의 수단)
  console.warn("[ExchangeRate] Using fallback rate 1,350");
  return 1350;
}

// 미국 주식 가격을 원화로 환산
export function usdToKrw(usd: number, rate: number): number {
  return Math.round(usd * rate);
}
