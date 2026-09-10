const { getLiveStockQuotes } = require("./marketService");

const getTradingSignals = async () => {
    const stocks = await getLiveStockQuotes(["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "ITC"]);
    return stocks.map((stock) => {
        const signal = stock.changePercent >= 1 ? "BUY" : stock.changePercent <= -1 ? "SELL" : "HOLD";
        return {
            ...stock,
            trend: stock.changePercent > 0.25 ? "Bullish" : stock.changePercent < -0.25 ? "Bearish" : "Neutral",
            signal,
            strength: Math.abs(stock.changePercent) >= 1 ? "Strong" : "Moderate",
            generatedAt: new Date().toISOString()
        };
    });
};

module.exports = { getTradingSignals };
