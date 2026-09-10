const { getStockQuote } = require("./marketService");

const getTradeAI = async (symbol = "RELIANCE") => {
    const quote = await getStockQuote(symbol);
    if (!quote) return null;

    const momentum = Math.max(0, Math.min(100, Math.round(50 + quote.changePercent * 10)));
    const buyingPressure = Math.max(0, Math.min(100, Math.round(50 + quote.changePercent * 8)));
    const sectorStrength = momentum;
    const score = Math.round((momentum + buyingPressure + sectorStrength) / 3);
    const signal = score >= 70 ? "BUY" : score <= 40 ? "SELL" : "HOLD";
    const trend = quote.changePercent > 0.25 ? "Bullish" : quote.changePercent < -0.25 ? "Bearish" : "Neutral";

    return {
        stock: { ...quote, name: symbol.toUpperCase() },
        analysis: {
            trend,
            signal,
            score,
            bullishFactors: quote.changePercent > 0 ? ["Positive live price movement"] : [],
            bearishFactors: quote.changePercent < 0 ? ["Negative live price movement"] : [],
            summary: `${symbol.toUpperCase()} analysis is based on the latest Angel One live quote.`
        }
    };
};

module.exports = { getTradeAI };
