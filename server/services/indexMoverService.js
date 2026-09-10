const { getLiveStockQuotes } = require("./marketService");

const getIndexMovers = async (index = "NIFTY 50") => {
    const stocks = await getLiveStockQuotes([
        "RELIANCE", "INFY", "TCS", "SBIN",
        "HDFCBANK", "ICICIBANK", "ITC", "AXISBANK"
    ]);
    const sorted = stocks.sort((a, b) => b.changePercent - a.changePercent);

    return {
        index,
        gainers: sorted.filter((stock) => stock.changePercent > 0).slice(0, 5),
        losers: sorted.filter((stock) => stock.changePercent < 0).slice(-5).reverse()
    };
};

module.exports = { getIndexMovers };
