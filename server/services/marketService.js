const {
    getAngelLTP,
    getAngelHistoricalData
} = require("./angelOneService");


// =====================================
// ANGEL ONE SYMBOL CONFIG
// =====================================

const marketSymbols = {

    nifty: {
        exchange: "NSE",
        tradingsymbol: "NIFTY",
        symboltoken: "99926000"
    },

    sensex: {
        exchange: "BSE",
        tradingsymbol: "SENSEX",
        symboltoken: "99919000"
    },

    bankNifty: {
        exchange: "NSE",
        tradingsymbol: "BANKNIFTY",
        symboltoken: "99926009"
    }

};


// =====================================
// FORMAT MARKET DATA
// =====================================

const formatMarketData = (data, symbol) => {

    console.log(
        `RAW ${symbol} DATA:`,
        JSON.stringify(data, null, 2)
    );

    const ltpData = data?.data;

    if (!ltpData) {
        console.log(
            `No LTP data received for ${symbol}`
        );

        return null;
    }

    const price = Number(ltpData.ltp || 0);

    const close = Number(ltpData.close || 0);

    const change = price - close;

    const changePercent =
        close > 0
            ? (change / close) * 100
            : 0;

    return {

        symbol,

        price: Number(
            price.toFixed(2)
        ),

        change: Number(
            change.toFixed(2)
        ),

        changePercent: Number(
            changePercent.toFixed(2)
        ),

        open: Number(ltpData.open || 0),
        high: Number(ltpData.high || 0),
        low: Number(ltpData.low || 0),
        close: Number(ltpData.close || 0),
        volume: Number(ltpData.tradeVolume || ltpData.volume || 0),
        week52High: Number(ltpData["52WeekHigh"] || 0),
        week52Low: Number(ltpData["52WeekLow"] || 0)

    };
};


// =====================================
// DELAY
// =====================================

const delay = (ms) =>
    new Promise(resolve =>
        setTimeout(resolve, ms)
    );


// =====================================
// MARKET OVERVIEW
// =====================================

const getMarketOverview = async () => {

    try {

        console.log(
            "Fetching NIFTY..."
        );

        const niftyData =
            await getAngelLTP(
                marketSymbols.nifty
            );


        await delay(1100);


        console.log(
            "Fetching SENSEX..."
        );

        const sensexData =
            await getAngelLTP(
                marketSymbols.sensex
            );


        await delay(1100);


        console.log(
            "Fetching BANK NIFTY..."
        );

        const bankNiftyData =
            await getAngelLTP(
                marketSymbols.bankNifty
            );


        return {

            nifty: formatMarketData(
                niftyData,
                "NIFTY 50"
            ),

            sensex: formatMarketData(
                sensexData,
                "SENSEX"
            ),

            bankNifty: formatMarketData(
                bankNiftyData,
                "BANK NIFTY"
            )

        };

    } catch (error) {

        console.log(
            "MARKET OVERVIEW ERROR:"
        );

        console.log(
            error.response?.data ||
            error.message
        );

        throw error;
    }
};


// =====================================
// STOCK SYMBOLS
// =====================================

const stockSymbols = {

    RELIANCE: {
        exchange: "NSE",
        tradingsymbol: "RELIANCE-EQ",
        symboltoken: "2885"
    },

    TCS: {
        exchange: "NSE",
        tradingsymbol: "TCS-EQ",
        symboltoken: "11536"
    },

    INFY: {
        exchange: "NSE",
        tradingsymbol: "INFY-EQ",
        symboltoken: "1594"
    },

    SBIN: {
        exchange: "NSE",
        tradingsymbol: "SBIN-EQ",
        symboltoken: "3045"
    },

    HDFCBANK: {
        exchange: "NSE",
        tradingsymbol: "HDFCBANK-EQ",
        symboltoken: "1333"
    },

    ICICIBANK: {
        exchange: "NSE",
        tradingsymbol: "ICICIBANK-EQ",
        symboltoken: "4963"
    },

    ITC: {
        exchange: "NSE",
        tradingsymbol: "ITC-EQ",
        symboltoken: "1660"
    },

    AXISBANK: {
        exchange: "NSE",
        tradingsymbol: "AXISBANK-EQ",
        symboltoken: "5900"
    }

};


// =====================================
// STOCK QUOTE
// =====================================

const getStockQuote = async (symbol) => {

    const upperSymbol =
        symbol.toUpperCase();

    const stockConfig =
        stockSymbols[upperSymbol];

    if (!stockConfig) {
        return null;
    }

    try {

        const data =
            await getAngelLTP(
                stockConfig
            );

        return formatMarketData(
            data,
            upperSymbol
        );

    } catch (error) {

        console.log(
            "STOCK QUOTE ERROR:",
            error.response?.data ||
            error.message
        );

        throw error;
    }

};

const getLiveStockQuotes = async (symbols) => {
    const quotes = await Promise.all(
        symbols.map(async (symbol) => {
            const quote = await getStockQuote(symbol);
            return quote ? { ...quote, name: symbol } : null;
        })
    );

    return quotes.filter(Boolean);
};


// =====================================
// HISTORICAL DATA
// =====================================

const getHistoricalData = async (
    symbol,
    timeframe = "1M"
) => {

    const upperSymbol =
        symbol.toUpperCase();

    const stockConfig =
        stockSymbols[upperSymbol];

    if (!stockConfig) {
        return null;
    }

    // Timeframe ke according date range + broker candle interval
    const now = new Date();
    let interval = "ONE_DAY";

    const fromDate = new Date(now);

    switch (timeframe) {

        case "1D":
            fromDate.setDate(now.getDate() - 1);
            interval = "FIVE_MINUTE";
            break;

        case "1W":
            fromDate.setDate(now.getDate() - 7);
            interval = "FIFTEEN_MINUTE";
            break;

        case "1M":
            fromDate.setMonth(now.getMonth() - 1);
            interval = "ONE_HOUR";
            break;

        case "3M":
            fromDate.setMonth(now.getMonth() - 3);
            interval = "ONE_DAY";
            break;

        case "6M":
            fromDate.setMonth(now.getMonth() - 6);
            interval = "ONE_DAY";
            break;

        case "1Y":
            fromDate.setFullYear(now.getFullYear() - 1);
            interval = "ONE_DAY";
            break;

        default:
            fromDate.setMonth(
                now.getMonth() - 1
            );
    }


    // Angel One format:
    // YYYY-MM-DD HH:mm
    const formatDate = (date) => {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        const hours =
            String(
                date.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                date.getMinutes()
            ).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };


    try {

    const response =
        await getAngelHistoricalData({

            exchange:
                stockConfig.exchange,

            symboltoken:
                stockConfig.symboltoken,

            interval,

            fromdate:
                formatDate(fromDate),

            todate:
                formatDate(now)

        });


    console.log(
        "REAL HISTORICAL DATA:",
        JSON.stringify(
            response,
            null,
            2
        )
    );


    const candles =
        response?.data || [];


    return candles.map((candle) => ({

        time: candle[0],

        open:
            Number(candle[1]),

        high:
            Number(candle[2]),

        low:
            Number(candle[3]),

        close:
            Number(candle[4]),

        volume:
            Number(candle[5])

    }));


} catch (error) {

    console.log(
        "HISTORICAL DATA ERROR:",
        error.response?.data ||
        error.message
    );

    throw error;

}
};


module.exports = {

    getMarketOverview,
    getStockQuote,
    getHistoricalData,
    getLiveStockQuotes,
    stockSymbols

};