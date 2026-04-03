export interface StockQuote {
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

// Yahoo Finance에서 crumb + cookie 획득
async function getYahooCrumb(): Promise<{ crumb: string; cookie: string } | null> {
  try {
    // 1. 쿠키 획득
    const initRes = await fetch("https://finance.yahoo.com/quote/AAPL/", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      redirect: "follow",
    });
    const cookies = initRes.headers.get("set-cookie") || "";

    // 2. crumb 획득
    const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Cookie: cookies,
      },
    });
    if (!crumbRes.ok) return null;
    const crumb = await crumbRes.text();
    return { crumb, cookie: cookies };
  } catch (err) {
    console.warn("[StockAPI] Failed to get Yahoo crumb:", err);
    return null;
  }
}

// Yahoo Finance v8 chart API (개별 조회 - 가장 안정적)
async function fetchViaChart(symbol: { code: string; name: string; yahoo_symbol: string; market: "KR" | "US" }): Promise<StockQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol.yahoo_symbol)}?range=1d&interval=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const indicators = data?.chart?.result?.[0]?.indicators?.quote?.[0];
    if (!meta || !meta.regularMarketPrice) return null;

    const prevClose = meta.chartPreviousClose || meta.previousClose || 0;
    const price = meta.regularMarketPrice;

    return {
      stock_code: symbol.code,
      stock_name: symbol.name,
      open_price: indicators?.open?.[0] ?? prevClose,
      close_price: price,
      high_price: indicators?.high?.[0] ?? price,
      low_price: indicators?.low?.[0] ?? price,
      volume: indicators?.volume?.[0] ?? 0,
      change_rate: prevClose > 0 ? Number((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0,
      market: symbol.market,
    };
  } catch {
    return null;
  }
}

// Yahoo Finance v7 quote API (crumb 필요)
async function fetchViaQuote(
  symbols: { code: string; name: string; yahoo_symbol: string; market: "KR" | "US" }[],
  crumb: string,
  cookie: string
): Promise<StockQuote[]> {
  const results: StockQuote[] = [];
  try {
    const yahooSymbols = symbols.map((s) => s.yahoo_symbol).join(",");
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(yahooSymbols)}&crumb=${encodeURIComponent(crumb)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Cookie: cookie,
      },
    });
    if (!res.ok) return results;
    const data = await res.json();
    const quotes = data?.quoteResponse?.result ?? [];

    for (const symbol of symbols) {
      const quote = quotes.find((q: Record<string, unknown>) => q.symbol === symbol.yahoo_symbol);
      if (quote && quote.regularMarketPrice) {
        results.push({
          stock_code: symbol.code,
          stock_name: symbol.name,
          open_price: Math.round(quote.regularMarketOpen ?? 0),
          close_price: Math.round(quote.regularMarketPrice ?? 0),
          high_price: Math.round(quote.regularMarketDayHigh ?? 0),
          low_price: Math.round(quote.regularMarketDayLow ?? 0),
          volume: quote.regularMarketVolume ?? 0,
          change_rate: Number((quote.regularMarketChangePercent ?? 0).toFixed(2)),
          market: symbol.market,
        });
      }
    }
  } catch (err) {
    console.warn("[StockAPI] v7 quote failed:", err);
  }
  return results;
}

export async function fetchStockQuotes(
  symbols: { code: string; name: string; yahoo_symbol: string; market: "KR" | "US" }[]
): Promise<StockQuote[]> {
  // 방법 1: v7 quote with crumb (빠름, 한 번에 여러 종목)
  const auth = await getYahooCrumb();
  if (auth) {
    const results = await fetchViaQuote(symbols, auth.crumb, auth.cookie);
    if (results.length > 0) {
      console.log(`[StockAPI] v7 quote success: ${results.length} stocks`);
      return results;
    }
  }

  // 방법 2: v8 chart (개별 조회, 더 안정적)
  console.log("[StockAPI] Trying v8 chart API...");
  const results: StockQuote[] = [];
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchViaChart));
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  if (results.length > 0) {
    console.log(`[StockAPI] v8 chart success: ${results.length} stocks`);
  } else {
    console.error("[StockAPI] All methods failed");
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
  if (/^\d{6}$/.test(stockCode)) {
    return `${stockCode}.KS`;
  }
  return stockCode;
}
