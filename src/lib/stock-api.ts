interface StockQuote {
  stock_code: string;
  stock_name: string;
  open_price: number;
  close_price: number;
  high_price: number;
  low_price: number;
  volume: number;
  change_rate: number;
  market: "KR" | "US";
}

// Yahoo Finance에서 한국/미국 주식 시세 조회
// 한국: 005930.KS (코스피) 또는 035720.KQ (코스닥)
// 미국: AAPL, MSFT 등
export async function fetchStockQuotes(
  symbols: { code: string; name: string; yahoo_symbol: string; market: "KR" | "US" }[]
): Promise<StockQuote[]> {
  const results: StockQuote[] = [];

  // Yahoo Finance API는 한 번에 여러 종목 조회 가능
  const yahooSymbols = symbols.map((s) => s.yahoo_symbol).join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(yahooSymbols)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      console.error(`[StockAPI] Yahoo Finance error: ${res.status}`);
      return results;
    }

    const data = await res.json();
    const quotes = data?.quoteResponse?.result ?? [];

    for (const symbol of symbols) {
      const quote = quotes.find(
        (q: Record<string, unknown>) => q.symbol === symbol.yahoo_symbol
      );

      if (quote) {
        results.push({
          stock_code: symbol.code,
          stock_name: symbol.name,
          open_price: Math.round(quote.regularMarketOpen ?? 0),
          close_price: Math.round(quote.regularMarketPrice ?? 0),
          high_price: Math.round(quote.regularMarketDayHigh ?? 0),
          low_price: Math.round(quote.regularMarketDayLow ?? 0),
          volume: quote.regularMarketVolume ?? 0,
          change_rate: Number(
            (quote.regularMarketChangePercent ?? 0).toFixed(2)
          ),
          market: symbol.market,
        });
      } else {
        console.warn(`[StockAPI] No data for ${symbol.yahoo_symbol}`);
      }
    }
  } catch (err) {
    console.error("[StockAPI] Fetch error:", err);
  }

  return results;
}

// 기본 관심 종목 (한국 + 미국)
export const DEFAULT_WATCHLIST = [
  // 한국 (코스피)
  { code: "005930", name: "삼성전자", yahoo_symbol: "005930.KS", market: "KR" as const },
  { code: "000660", name: "SK하이닉스", yahoo_symbol: "000660.KS", market: "KR" as const },
  { code: "035720", name: "카카오", yahoo_symbol: "035720.KS", market: "KR" as const },
  { code: "373220", name: "LG에너지솔루션", yahoo_symbol: "373220.KS", market: "KR" as const },
  { code: "005380", name: "현대차", yahoo_symbol: "005380.KS", market: "KR" as const },

  // 미국
  { code: "AAPL", name: "Apple", yahoo_symbol: "AAPL", market: "US" as const },
  { code: "NVDA", name: "NVIDIA", yahoo_symbol: "NVDA", market: "US" as const },
  { code: "MSFT", name: "Microsoft", yahoo_symbol: "MSFT", market: "US" as const },
  { code: "GOOGL", name: "Google", yahoo_symbol: "GOOGL", market: "US" as const },
  { code: "TSLA", name: "Tesla", yahoo_symbol: "TSLA", market: "US" as const },
];

// 한국 종목코드 → Yahoo 심볼 변환
export function toYahooSymbol(stockCode: string): string {
  // 숫자 6자리면 한국 종목
  if (/^\d{6}$/.test(stockCode)) {
    return `${stockCode}.KS`;
  }
  // 그 외는 미국 종목 (티커 그대로)
  return stockCode;
}
