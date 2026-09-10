const { getStockQuote } = require("./marketService");

const getStockStats = async (symbol) => {
    const quote = await getStockQuote(symbol);
    if (!quote) return null;

    return {
        open: quote.open,
        high: quote.high,
        low: quote.low,
        previousClose: quote.close,
        volume: quote.volume,
        week52High: quote.week52High,
        week52Low: quote.week52Low,
        marketCap: null
    };
};

module.exports = { getStockStats };
