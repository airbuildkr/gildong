interface NewsHeadline {
  title: string;
  source: string;
}

// 네이버 금융 뉴스 헤드라인 수집 (종목별)
export async function fetchStockNews(stockName: string): Promise<NewsHeadline[]> {
  try {
    const query = encodeURIComponent(`${stockName} 주식`);
    const url = `https://search.naver.com/search.naver?where=news&query=${query}&sort=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) return [];

    const html = await res.text();
    const headlines: NewsHeadline[] = [];

    // 간단한 정규식으로 뉴스 제목 추출
    const titleRegex = /class="news_tit"[^>]*title="([^"]+)"/g;
    let match;
    let count = 0;
    while ((match = titleRegex.exec(html)) !== null && count < 3) {
      headlines.push({
        title: match[1],
        source: "네이버뉴스",
      });
      count++;
    }

    return headlines;
  } catch (err) {
    console.warn(`[News] Failed to fetch news for ${stockName}:`, err);
    return [];
  }
}

// 여러 종목의 뉴스를 수집하여 요약 문자열로 반환
export async function collectNewsForStocks(
  stocks: { stock_code: string; stock_name: string }[]
): Promise<Map<string, string>> {
  const newsMap = new Map<string, string>();

  // 병렬 처리 (최대 5개씩)
  const batchSize = 5;
  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (s) => {
        const headlines = await fetchStockNews(s.stock_name);
        const summary = headlines.map((h) => h.title).join(" / ") || "";
        return { code: s.stock_code, summary };
      })
    );
    for (const r of results) {
      newsMap.set(r.code, r.summary);
    }
  }

  return newsMap;
}
