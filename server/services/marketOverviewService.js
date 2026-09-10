const {
    getMarketOverview: getAngelMarketOverview,
    getLiveStockQuotes
} = require("./marketService");

const getMarketOverview = async () => {
    const liveIndices = await getAngelMarketOverview();
    const stocks = await getLiveStockQuotes([
        "RELIANCE", "TCS", "INFY", "SBIN",
        "HDFCBANK", "ICICIBANK", "ITC", "AXISBANK"
    ]);
    const indices = Object.values(liveIndices).filter(Boolean);
    const breadth = {
        advances: stocks.filter((stock) => stock.changePercent > 0).length,
        declines: stocks.filter((stock) => stock.changePercent < 0).length,
        unchanged: stocks.filter((stock) => stock.changePercent === 0).length
    };
    const total = breadth.advances + breadth.declines + breadth.unchanged;
    const bullish = total ? (breadth.advances / total) * 100 : 0;
    const bearish = total ? (breadth.declines / total) * 100 : 0;

    return {
        indices,
        marketBias: bullish > bearish ? "Bullish" : bearish > bullish ? "Bearish" : "Neutral",
        breadth,
        distribution: {
            bullish: Number(bullish.toFixed(2)),
            bearish: Number(bearish.toFixed(2)),
            neutral: Number((100 - bullish - bearish).toFixed(2))
        }
    };
};

module.exports = { getMarketOverview };
