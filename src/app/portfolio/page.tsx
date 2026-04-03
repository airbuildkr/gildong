import { getTradeHistory, getPortfolioSummary } from "@/lib/data";

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

export default async function PortfolioPage() {
  const [summary, trades] = await Promise.all([
    getPortfolioSummary(),
    getTradeHistory(),
  ]);

  const { totalValue, profitRate, cashBalance, days, items } = summary;
  const isProfit = profitRate >= 0;

  return (
    <>
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold">gildong.ai</h1>
      </header>

      {/* Summary */}
      <section className="border border-gray-100 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">총 평가금액</p>
            <p className="text-lg font-bold">{formatNumber(totalValue)}원</p>
          </div>
          <div>
            <p className="text-gray-400">총 수익률</p>
            <p className={`text-lg font-bold ${isProfit ? "text-profit" : "text-loss"}`}>
              {isProfit ? "+" : ""}{profitRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400">현금 잔고</p>
            <p className="text-lg font-bold">{formatNumber(cashBalance)}원</p>
          </div>
          <div>
            <p className="text-gray-400">운용일수</p>
            <p className="text-lg font-bold">{days}일</p>
          </div>
        </div>
      </section>

      {/* Holdings */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4">보유 종목</h2>
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const isItemProfit = item.profit_rate >= 0;
            const barWidth = Math.min(Math.abs(item.profit_rate) * 10, 100);
            return (
              <div key={item.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{item.stock_name}</p>
                    <p className="text-xs text-gray-400">{item.quantity}주</p>
                  </div>
                  <span className={`text-sm font-bold ${isItemProfit ? "text-profit" : "text-loss"}`}>
                    {isItemProfit ? "+" : ""}{item.profit_rate.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  평균 {formatNumber(item.avg_price)} → 현재 {formatNumber(item.current_price)}
                </p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isItemProfit ? "bg-profit" : "bg-loss"}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trade History */}
      <section>
        <h2 className="text-base font-bold mb-4">전체 매매 기록</h2>
        <div className="flex flex-col gap-2">
          {trades.map((trade) => {
            const date = new Date(trade.date);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            const isBuy = trade.action === "buy";
            return (
              <div
                key={trade.id}
                className="flex items-center justify-between py-3 border-b border-gray-50 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-10">{dateStr}</span>
                  <span className="font-medium">{trade.stock_name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      isBuy ? "bg-red-50 text-loss" : "bg-green-50 text-profit"
                    }`}
                  >
                    {isBuy ? "매수" : "매도"}
                  </span>
                </div>
                <div className="text-right text-gray-500">
                  <span>{trade.quantity}주 @{formatNumber(trade.price)}</span>
                  {trade.profit_loss !== null && (
                    <span className="ml-2 text-profit font-medium">+{trade.profit_loss}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
