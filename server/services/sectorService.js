const { getLiveStockQuotes } = require("./marketService");

const sectorStocks = {
    IT: ["TCS", "INFY"],
    Banking: ["SBIN", "HDFCBANK", "ICICIBANK", "AXISBANK"],
    Energy: ["RELIANCE"],
    FMCG: ["ITC"]
};

const getSectorData = async () => {
    const symbols = [...new Set(Object.values(sectorStocks).flat())];
    const quotes = await getLiveStockQuotes(symbols);
    const bySymbol = Object.fromEntries(quotes.map((quote) => [quote.symbol, quote]));
    const sectors = Object.entries(sectorStocks).map(([name, members]) => {
        const available = members.map((symbol) => bySymbol[symbol]).filter(Boolean);
        const changePercent = available.length
            ? available.reduce((sum, quote) => sum + quote.changePercent, 0) / available.length
            : 0;
        return { name, changePercent: Number(changePercent.toFixed(2)) };
    });
    const sorted = [...sectors].sort((a, b) => b.changePercent - a.changePercent);

    return { sectors, topGainer: sorted[0], topLoser: sorted[sorted.length - 1] };
};

module.exports = { getSectorData };
