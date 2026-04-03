import { StockQuote } from "./stock-api";

interface ScreenerStock {
  code: string;
  name: string;
  yahoo_symbol: string;
  market: "KR" | "US";
}

// 코스피 시가총액 상위 30 (대형주)
const KOSPI_TOP_30: ScreenerStock[] = [
  { code: "005930", name: "삼성전자", yahoo_symbol: "005930.KS", market: "KR" },
  { code: "000660", name: "SK하이닉스", yahoo_symbol: "000660.KS", market: "KR" },
  { code: "373220", name: "LG에너지솔루션", yahoo_symbol: "373220.KS", market: "KR" },
  { code: "005380", name: "현대차", yahoo_symbol: "005380.KS", market: "KR" },
  { code: "000270", name: "기아", yahoo_symbol: "000270.KS", market: "KR" },
  { code: "068270", name: "셀트리온", yahoo_symbol: "068270.KS", market: "KR" },
  { code: "035420", name: "NAVER", yahoo_symbol: "035420.KS", market: "KR" },
  { code: "035720", name: "카카오", yahoo_symbol: "035720.KS", market: "KR" },
  { code: "051910", name: "LG화학", yahoo_symbol: "051910.KS", market: "KR" },
  { code: "006400", name: "삼성SDI", yahoo_symbol: "006400.KS", market: "KR" },
  { code: "055550", name: "신한지주", yahoo_symbol: "055550.KS", market: "KR" },
  { code: "105560", name: "KB금융", yahoo_symbol: "105560.KS", market: "KR" },
  { code: "003670", name: "포스코퓨처엠", yahoo_symbol: "003670.KS", market: "KR" },
  { code: "028260", name: "삼성물산", yahoo_symbol: "028260.KS", market: "KR" },
  { code: "012330", name: "현대모비스", yahoo_symbol: "012330.KS", market: "KR" },
  { code: "066570", name: "LG전자", yahoo_symbol: "066570.KS", market: "KR" },
  { code: "032830", name: "삼성생명", yahoo_symbol: "032830.KS", market: "KR" },
  { code: "003550", name: "LG", yahoo_symbol: "003550.KS", market: "KR" },
  { code: "034730", name: "SK", yahoo_symbol: "034730.KS", market: "KR" },
  { code: "096770", name: "SK이노베이션", yahoo_symbol: "096770.KS", market: "KR" },
  { code: "030200", name: "KT", yahoo_symbol: "030200.KS", market: "KR" },
  { code: "086790", name: "하나금융지주", yahoo_symbol: "086790.KS", market: "KR" },
  { code: "017670", name: "SK텔레콤", yahoo_symbol: "017670.KS", market: "KR" },
  { code: "316140", name: "우리금융지주", yahoo_symbol: "316140.KS", market: "KR" },
  { code: "009150", name: "삼성전기", yahoo_symbol: "009150.KS", market: "KR" },
  { code: "010130", name: "고려아연", yahoo_symbol: "010130.KS", market: "KR" },
  { code: "034020", name: "두산에너빌리티", yahoo_symbol: "034020.KS", market: "KR" },
  { code: "011200", name: "HMM", yahoo_symbol: "011200.KS", market: "KR" },
  { code: "018260", name: "삼성에스디에스", yahoo_symbol: "018260.KS", market: "KR" },
  { code: "247540", name: "에코프로비엠", yahoo_symbol: "247540.KS", market: "KR" },
];

// 미국 주요 대형주 30 (S&P 500 상위)
const US_TOP_30: ScreenerStock[] = [
  { code: "AAPL", name: "Apple", yahoo_symbol: "AAPL", market: "US" },
  { code: "MSFT", name: "Microsoft", yahoo_symbol: "MSFT", market: "US" },
  { code: "NVDA", name: "NVIDIA", yahoo_symbol: "NVDA", market: "US" },
  { code: "GOOGL", name: "Google", yahoo_symbol: "GOOGL", market: "US" },
  { code: "AMZN", name: "Amazon", yahoo_symbol: "AMZN", market: "US" },
  { code: "META", name: "Meta", yahoo_symbol: "META", market: "US" },
  { code: "TSLA", name: "Tesla", yahoo_symbol: "TSLA", market: "US" },
  { code: "BRK-B", name: "Berkshire Hathaway", yahoo_symbol: "BRK-B", market: "US" },
  { code: "TSM", name: "TSMC", yahoo_symbol: "TSM", market: "US" },
  { code: "AVGO", name: "Broadcom", yahoo_symbol: "AVGO", market: "US" },
  { code: "JPM", name: "JPMorgan", yahoo_symbol: "JPM", market: "US" },
  { code: "LLY", name: "Eli Lilly", yahoo_symbol: "LLY", market: "US" },
  { code: "V", name: "Visa", yahoo_symbol: "V", market: "US" },
  { code: "UNH", name: "UnitedHealth", yahoo_symbol: "UNH", market: "US" },
  { code: "MA", name: "Mastercard", yahoo_symbol: "MA", market: "US" },
  { code: "XOM", name: "Exxon Mobil", yahoo_symbol: "XOM", market: "US" },
  { code: "JNJ", name: "Johnson & Johnson", yahoo_symbol: "JNJ", market: "US" },
  { code: "COST", name: "Costco", yahoo_symbol: "COST", market: "US" },
  { code: "HD", name: "Home Depot", yahoo_symbol: "HD", market: "US" },
  { code: "PG", name: "Procter & Gamble", yahoo_symbol: "PG", market: "US" },
  { code: "ABBV", name: "AbbVie", yahoo_symbol: "ABBV", market: "US" },
  { code: "AMD", name: "AMD", yahoo_symbol: "AMD", market: "US" },
  { code: "CRM", name: "Salesforce", yahoo_symbol: "CRM", market: "US" },
  { code: "NFLX", name: "Netflix", yahoo_symbol: "NFLX", market: "US" },
  { code: "MRK", name: "Merck", yahoo_symbol: "MRK", market: "US" },
  { code: "ADBE", name: "Adobe", yahoo_symbol: "ADBE", market: "US" },
  { code: "QCOM", name: "Qualcomm", yahoo_symbol: "QCOM", market: "US" },
  { code: "INTC", name: "Intel", yahoo_symbol: "INTC", market: "US" },
  { code: "DIS", name: "Disney", yahoo_symbol: "DIS", market: "US" },
  { code: "COIN", name: "Coinbase", yahoo_symbol: "COIN", market: "US" },
];

// 전체 스크리닝 대상 (코스피 30 + 미국 30 = 60종목)
export const FULL_UNIVERSE = [...KOSPI_TOP_30, ...US_TOP_30];

// 주가 데이터에서 주목할 종목 필터링 (급등/급락/거래량 급증)
export function filterNotableStocks(quotes: StockQuote[]): {
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  highVolume: StockQuote[];
} {
  const sorted = [...quotes].sort((a, b) => b.change_rate - a.change_rate);

  return {
    topGainers: sorted.filter((q) => q.change_rate > 2).slice(0, 5),
    topLosers: sorted.filter((q) => q.change_rate < -2).slice(0, 5).reverse(),
    highVolume: [...quotes]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5),
  };
}

// AI에게 전달할 스크리닝 요약 생성
export function formatScreeningSummary(
  quotes: StockQuote[],
  notable: ReturnType<typeof filterNotableStocks>
): string {
  const krQuotes = quotes.filter((q) => q.market === "KR");
  const usQuotes = quotes.filter((q) => q.market === "US");

  const avgKR = krQuotes.length > 0
    ? (krQuotes.reduce((s, q) => s + q.change_rate, 0) / krQuotes.length).toFixed(2)
    : "N/A";
  const avgUS = usQuotes.length > 0
    ? (usQuotes.reduce((s, q) => s + q.change_rate, 0) / usQuotes.length).toFixed(2)
    : "N/A";

  return `
## 시장 스크리닝 결과 (${quotes.length}종목 분석)

### 시장 전체 분위기
- 한국 주요주 평균 등락률: ${avgKR}%
- 미국 주요주 평균 등락률: ${avgUS}%

### 급등 종목 (전일 대비 +2% 이상)
${notable.topGainers.map((q) => `- [${q.market}] ${q.stock_name}(${q.stock_code}): ${q.change_rate > 0 ? "+" : ""}${q.change_rate}%, 종가 ${q.close_price}`).join("\n") || "없음"}

### 급락 종목 (전일 대비 -2% 이상)
${notable.topLosers.map((q) => `- [${q.market}] ${q.stock_name}(${q.stock_code}): ${q.change_rate}%, 종가 ${q.close_price}`).join("\n") || "없음"}

### 거래량 상위
${notable.highVolume.map((q) => `- [${q.market}] ${q.stock_name}(${q.stock_code}): 거래량 ${q.volume.toLocaleString()}, 등락 ${q.change_rate}%`).join("\n") || "없음"}

### 전체 종목 시세
${quotes.map((q) => `- [${q.market}] ${q.stock_name}(${q.stock_code}): 종가 ${q.close_price}, ${q.change_rate > 0 ? "+" : ""}${q.change_rate}%`).join("\n")}
`;
}
