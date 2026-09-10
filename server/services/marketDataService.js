const { getAngelHistoricalData, getAngelPCR } = require("./angelOneService");

const {
    getMarketOverview,
    getStockQuote,
    getHistoricalData
} = require("./marketService");
const {
    getNifty50Stocks
} = require("./breadthService");

const INDEXES = {
    NIFTY50: { symbol: "NIFTY50", name: "NIFTY 50", marketKey: "nifty" },
    BANKNIFTY: { symbol: "BANKNIFTY", name: "NIFTY BANK", marketKey: "bankNifty" },
    SENSEX: { symbol: "SENSEX", name: "SENSEX", marketKey: "sensex" }
};

const STOCK_NAMES = {
    RELIANCE: "Reliance Industries",
    TCS: "Tata Consultancy Services",
    INFY: "Infosys",
    SBIN: "State Bank of India",
    HDFCBANK: "HDFC Bank",
    ICICIBANK: "ICICI Bank",
    ITC: "ITC",
    AXISBANK: "Axis Bank"
};

const STOCK_LIST = Object.keys(STOCK_NAMES);

let stockCache = { value: null, expiresAt: 0 };
let indexCache = { value: null, expiresAt: 0 };
const CACHE_MS = 5000;

const getIndices = async () => {
    if (indexCache.value && Date.now() < indexCache.expiresAt) {
        return indexCache.value;
    }

    const overview = await getMarketOverview();

    const result = [
        overview.nifty && {
            symbol: INDEXES.NIFTY50.symbol,
            name: INDEXES.NIFTY50.name,
            value: overview.nifty.price,
            price: overview.nifty.price,
            change: overview.nifty.change,
            changePercent: overview.nifty.changePercent,
            open: overview.nifty.open,
            high: overview.nifty.high,
            low: overview.nifty.low,
            close: overview.nifty.close,
            volume: overview.nifty.volume
        },
        overview.bankNifty && {
            symbol: INDEXES.BANKNIFTY.symbol,
            name: INDEXES.BANKNIFTY.name,
            value: overview.bankNifty.price,
            price: overview.bankNifty.price,
            change: overview.bankNifty.change,
            changePercent: overview.bankNifty.changePercent,
            open: overview.bankNifty.open,
            high: overview.bankNifty.high,
            low: overview.bankNifty.low,
            close: overview.bankNifty.close,
            volume: overview.bankNifty.volume
        },
        overview.sensex && {
            symbol: INDEXES.SENSEX.symbol,
            name: INDEXES.SENSEX.name,
            value: overview.sensex.price,
            price: overview.sensex.price,
            change: overview.sensex.change,
            changePercent: overview.sensex.changePercent,
            open: overview.sensex.open,
            high: overview.sensex.high,
            low: overview.sensex.low,
            close: overview.sensex.close,
            volume: overview.sensex.volume
        }
    ].filter(Boolean);

    indexCache = { value: result, expiresAt: Date.now() + CACHE_MS };
    return result;
};

const getStocks = async () => {

    if (
        stockCache.value &&
        Date.now() < stockCache.expiresAt
    ) {
        return stockCache.value;
    }

    console.log(
        "CENTRAL STOCK DATA: Fetching NIFTY 50 stocks..."
    );

    const stocks =
        await getNifty50Stocks();

    const result =
        stocks.map((stock) => ({
            ...stock,

            name:
                STOCK_NAMES[stock.symbol] ||
                stock.symbol,

            value:
                stock.price
        }));

    stockCache = {
        value: result,
        expiresAt:
            Date.now() + CACHE_MS
    };

    console.log(
        `CENTRAL STOCK DATA: ${result.length} stocks received`
    );

    return result;
};

const getStock = async (symbol) => {
    const upper = symbol.toUpperCase();
    const stock = await getStockQuote(upper);

    if (!stock) {
        throw new Error("Stock not found");
    }

    return {
        ...stock,
        name: STOCK_NAMES[upper] || upper,
        value: stock.price
    };
};

// Sector performance is calculated from live constituent quotes.
// It is a lightweight proxy, not an official NSE sector-index value.
const SECTOR_GROUPS = {
    IT: ["TCS", "INFY"],
    Banking: ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK"],
    Energy: ["RELIANCE"],
    FMCG: ["ITC"],
    Auto: [],
    Pharma: []
};

const getSectors = async () => {
    const stocks = await getStocks();
    const bySymbol = new Map(stocks.map((stock) => [stock.symbol, stock]));

    return Object.entries(SECTOR_GROUPS).map(([name, symbols]) => {
        const values = symbols
            .map((symbol) => bySymbol.get(symbol)?.changePercent)
            .filter((value) => Number.isFinite(value));

        const changePercent = values.length
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : null;

        return {
            name,
            value: changePercent === null ? null : Number(changePercent.toFixed(2)),
            changePercent: changePercent === null ? null : Number(changePercent.toFixed(2)),
            source: "live constituent average"
        };
    });
};

// PCR requires the broker's option-chain endpoint. Keep this endpoint honest rather
// than returning fake OI/PCR numbers. The UI can show unavailable until option-chain
// integration is configured.
// =====================================
// GET PCR
// =====================================

const getPCR = async () => {

    try {

        console.log("MARKET DATA SERVICE: Fetching PCR");


        const response =
            await getAngelPCR();


        console.log(
            "MARKET DATA PCR RAW:",
            JSON.stringify(
                response,
                null,
                2
            )
        );


        const rows =
            Array.isArray(response?.data)
                ? response.data
                : [];


        const nifty =
            rows.find(
                (row) =>
                    /NIFTY/i.test(
                        row?.tradingSymbol || ""
                    )
            );


        const pcr =
            Number(
                nifty?.pcr
            );


        return {

            value:
                Number.isFinite(pcr)
                    ? pcr
                    : null,

            pcr:
                Number.isFinite(pcr)
                    ? pcr
                    : null,

            sentiment:
                !Number.isFinite(pcr)
                    ? "Unavailable"
                    : pcr >= 1.1
                        ? "Bullish"
                        : pcr <= 0.9
                            ? "Bearish"
                            : "Neutral",

            tradingSymbol:
                nifty?.tradingSymbol || null,

            rawCount:
                rows.length

        };


    } catch (error) {

        console.log(
            "GET PCR SERVICE ERROR:",
            error.response?.data ||
            error.message
        );


        throw error;
    }
};

const getHistory = async (symbol, timeframe = "1D") => {
    const upper = symbol.toUpperCase();

    // Indexes have dedicated tokens in marketService; stocks are supported there too.
    const indexConfig = {
        NIFTY50: { exchange: "NSE", symboltoken: "99926000" },
        BANKNIFTY: { exchange: "NSE", symboltoken: "99926009" },
        SENSEX: { exchange: "BSE", symboltoken: "99919000" }
    }[upper];

    if (!indexConfig) {
        return getHistoricalData(upper, timeframe);
    }

    const now = new Date();
    const from = new Date(now);
    let interval = "ONE_DAY";

    switch (timeframe) {
        case "1D":
            from.setDate(now.getDate() - 1);
            interval = "FIVE_MINUTE";
            break;
        case "1W":
            from.setDate(now.getDate() - 7);
            interval = "FIFTEEN_MINUTE";
            break;
        case "1M":
            from.setMonth(now.getMonth() - 1);
            interval = "ONE_HOUR";
            break;
        case "3M":
            from.setMonth(now.getMonth() - 3);
            interval = "ONE_DAY";
            break;
        case "6M":
            from.setMonth(now.getMonth() - 6);
            interval = "ONE_DAY";
            break;
        case "1Y":
            from.setFullYear(now.getFullYear() - 1);
            interval = "ONE_DAY";
            break;
        default:
            throw new Error("Invalid timeframe");
    }

    const formatDate = (date) => {
        const pad = (n) => String(n).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const response = await getAngelHistoricalData({
        exchange: indexConfig.exchange,
        symboltoken: indexConfig.symboltoken,
        interval,
        fromdate: formatDate(from),
        todate: formatDate(now)
    });

    const candles = response?.data || [];

    return candles.map((candle) => ({
        time: candle[0],
        open: Number(candle[1]),
        high: Number(candle[2]),
        low: Number(candle[3]),
        close: Number(candle[4]),
        volume: Number(candle[5] || 0),
        price: Number(candle[4])
    }));
};

module.exports = {
    getIndices,
    getStocks,
    getStock,
    getSectors,
    getPCR,
    getHistory
};
