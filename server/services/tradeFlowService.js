const {
    getAngelFullQuotes
} = require("./angelOneService");

const {
    loadInstrumentMaster
} = require("./breadthService");


// =====================================================
// CONFIG
// =====================================================

const CACHE_DURATION = 30 * 1000;

const MAX_STOCKS = 500;

const BATCH_SIZE = 50;

const BATCH_DELAY = 1100;


// =====================================================
// CACHE
// =====================================================

let tradeFlowCache = {

    allStocks: [],

    fnoStocks: [],

    updatedAt: null,

    expiresAt: 0,

    marketStatus: {
        isOpen: false,
        status: "CLOSED",
        reason: "Market closed"
    }

};


// =====================================================
// REFRESH LOCK
// =====================================================

let refreshPromise = null;


// =====================================================
// VOLUME SNAPSHOTS
// =====================================================
//
// symbol -> {
//
//     volume: current cumulative volume,
//
//     intervalVolume: previous interval volume
//
// }
//

const volumeSnapshots = new Map();


// =====================================================
// DELAY
// =====================================================

const delay = (ms) => {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

};


// =====================================================
// SAFE NUMBER
// =====================================================

const safeNumber = (value, fallback = 0) => {

    const number = Number(value);

    if (!Number.isFinite(number)) {

        return fallback;

    }

    return number;

};


// =====================================================
// CLEAN SYMBOL
// =====================================================

const cleanSymbol = (symbol) => {

    return String(symbol || "")
        .replace("-EQ", "")
        .trim()
        .toUpperCase();

};


// =====================================================
// MARKET STATUS
// =====================================================
//
// NSE normal equity market:
//
// Monday-Friday
// 09:15 - 15:30 IST
//
// NOTE:
// Exchange holidays are not handled here.
// Angel One response should still be treated
// as the ultimate market-data source.
//

const getMarketStatus = () => {

    const now = new Date();

    const parts = new Intl.DateTimeFormat(
        "en-IN",
        {
            timeZone: "Asia/Kolkata",
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }
    ).formatToParts(now);

    const values = {};

    parts.forEach(part => {

        if (part.type !== "literal") {

            values[part.type] = part.value;

        }

    });

    const weekday = values.weekday;

    const hour = Number(values.hour);

    const minute = Number(values.minute);

    const second = Number(values.second);


    const totalSeconds =
        hour * 3600 +
        minute * 60 +
        second;


    const marketOpenSeconds =
        9 * 3600 +
        15 * 60;


    const marketCloseSeconds =
        15 * 3600 +
        30 * 60;


    const isWeekday =
        weekday !== "Sat" &&
        weekday !== "Sun";


    const isOpen =
        isWeekday &&
        totalSeconds >= marketOpenSeconds &&
        totalSeconds < marketCloseSeconds;


    if (!isWeekday) {

        return {

            isOpen: false,

            status: "CLOSED",

            reason: "Weekend"

        };

    }


    if (totalSeconds < marketOpenSeconds) {

        return {

            isOpen: false,

            status: "PRE_OPEN",

            reason: "Market opens at 09:15 IST"

        };

    }


    if (totalSeconds >= marketCloseSeconds) {

        return {

            isOpen: false,

            status: "CLOSED",

            reason: "Market closed"

        };

    }


    return {

        isOpen: true,

        status: "LIVE",

        reason: "Market is open"

    };

};


// =====================================================
// CALCULATE X FACTOR
// =====================================================

const calculateXFactor = (
    symbol,
    currentVolume
) => {

    const current =
        safeNumber(
            currentVolume,
            0
        );


    if (current <= 0) {

        return {

            xFactor: null,

            intervalVolume: 0,

            previousIntervalVolume: 0,

            hasXFactorHistory: false

        };

    }


    const previous =
        volumeSnapshots.get(symbol);


    // ==========================================
    // FIRST SNAPSHOT
    // ==========================================

    if (!previous) {

        volumeSnapshots.set(
            symbol,
            {

                volume: current,

                intervalVolume: 0

            }
        );


        return {

            xFactor: null,

            intervalVolume: 0,

            previousIntervalVolume: 0,

            hasXFactorHistory: false

        };

    }


    // ==========================================
    // CURRENT INTERVAL
    // ==========================================

    const currentIntervalVolume =
        Math.max(
            current -
            previous.volume,
            0
        );


    // ==========================================
    // NO NEW VOLUME
    // ==========================================

    if (
        currentIntervalVolume <= 0
    ) {

        volumeSnapshots.set(
            symbol,
            {

                volume: current,

                intervalVolume:
                    previous.intervalVolume

            }
        );


        return {

            xFactor: null,

            intervalVolume: 0,

            previousIntervalVolume:
                previous.intervalVolume,

            hasXFactorHistory:
                previous.intervalVolume > 0

        };

    }


    // ==========================================
    // SECOND SNAPSHOT
    // ==========================================

    if (
        previous.intervalVolume <= 0
    ) {

        volumeSnapshots.set(
            symbol,
            {

                volume: current,

                intervalVolume:
                    currentIntervalVolume

            }
        );


        return {

            xFactor: null,

            intervalVolume:
                currentIntervalVolume,

            previousIntervalVolume: 0,

            hasXFactorHistory: false

        };

    }


    // ==========================================
    // REAL X FACTOR
    // ==========================================

    const factor =
        currentIntervalVolume /
        previous.intervalVolume;


    // ==========================================
    // SAVE SNAPSHOT
    // ==========================================

    volumeSnapshots.set(
        symbol,
        {

            volume: current,

            intervalVolume:
                currentIntervalVolume

        }
    );


    // ==========================================
    // PROTECT VALUE
    // ==========================================

    const safeFactor =
        Math.min(
            Math.max(
                factor,
                0.1
            ),
            20
        );


    return {

        xFactor: safeFactor,

        intervalVolume:
            currentIntervalVolume,

        previousIntervalVolume:
            previous.intervalVolume,

        hasXFactorHistory: true

    };

};


// =====================================================
// CALCULATE SIGNAL
// =====================================================

const calculateSignal = (
    stock
) => {

    const change =
        safeNumber(
            stock.percentChange,
            0
        );


    const xFactor =
        safeNumber(
            stock.xFactor,
            0
        );


    // ==========================================
    // NO X FACTOR YET
    // ==========================================

    if (
        stock.xFactor === null ||
        !stock.hasXFactorHistory
    ) {

        if (change >= 2) {

            return "Momentum";

        }

        if (change <= -2) {

            return "Weakness";

        }

        return "Neutral";

    }


    // ==========================================
    // VOLUME SHOCK
    // ==========================================

    if (
        xFactor >= 3 &&
        change >= 1
    ) {

        return "Volume Shock";

    }


    // ==========================================
    // SELLING SHOCK
    // ==========================================

    if (
        xFactor >= 3 &&
        change <= -1
    ) {

        return "Selling Shock";

    }


    // ==========================================
    // BREAKOUT
    // ==========================================

    if (
        xFactor >= 2 &&
        change > 0
    ) {

        return "Breakout";

    }


    // ==========================================
    // HIGH MOMENTUM
    // ==========================================

    if (
        change >= 2
    ) {

        return "Momentum";

    }


    // ==========================================
    // WEAKNESS
    // ==========================================

    if (
        change <= -2
    ) {

        return "Weakness";

    }


    return "Neutral";

};


// =====================================================
// FETCH QUOTE BATCH
// =====================================================

const fetchQuoteBatch = async (
    instruments
) => {

    const exchangeTokens = {

        NSE:
            instruments.map(
                item =>
                    String(item.token)
            )

    };


    const response =
        await getAngelFullQuotes(
            exchangeTokens
        );


    return (
        response?.data?.fetched ||
        []
    );

};


// =====================================================
// TRANSFORM QUOTE
// =====================================================

const transformQuote = (
    quote,
    instrumentMap,
    marketStatus
) => {

    try {

        const token =
            String(
                quote.symbolToken || ""
            );


        const instrument =
            instrumentMap.get(token);


        const symbol =
            cleanSymbol(
                instrument?.symbol ||
                quote.tradingSymbol
            );


        const price =
            safeNumber(
                quote.ltp,
                0
            );


        const percentChange =
            safeNumber(
                quote.percentChange,
                0
            );


        const volume =
            safeNumber(
                quote.tradeVolume,
                0
            );


        // ==========================================
        // X FACTOR
        // ==========================================

        let xFactorData = {

            xFactor: null,

            intervalVolume: 0,

            previousIntervalVolume: 0,

            hasXFactorHistory: false

        };


        // Only update snapshots when market is LIVE

        if (
            marketStatus.isOpen
        ) {

            xFactorData =
                calculateXFactor(
                    symbol,
                    volume
                );

        }


        const result = {

            symbol,

            name:
                instrument?.name ||
                symbol,

            tradingSymbol:
                quote.tradingSymbol ||
                symbol,

            token,

            price,

            value: price,

            change:
                safeNumber(
                    quote.netChange,
                    0
                ),

            changePercent:
                Number(
                    percentChange.toFixed(2)
                ),

            volume,

            intervalVolume:
                xFactorData.intervalVolume,

            previousIntervalVolume:
                xFactorData.previousIntervalVolume,

            hasXFactorHistory:
                xFactorData.hasXFactorHistory,

            avgPrice:
                safeNumber(
                    quote.avgPrice,
                    0
                ),

            open:
                safeNumber(
                    quote.open,
                    0
                ),

            high:
                safeNumber(
                    quote.high,
                    0
                ),

            low:
                safeNumber(
                    quote.low,
                    0
                ),

            close:
                safeNumber(
                    quote.close,
                    0
                ),

            buyQuantity:
                safeNumber(
                    quote.totBuyQuan,
                    0
                ),

            sellQuantity:
                safeNumber(
                    quote.totSellQuan,
                    0
                ),

            openInterest:
                safeNumber(
                    quote.opnInterest,
                    0
                ),

            xFactor:
                xFactorData.xFactor === null
                    ? null
                    : Number(
                        xFactorData.xFactor.toFixed(2)
                    ),

            signal:
                calculateSignal({

                    percentChange,

                    xFactor:
                        xFactorData.xFactor,

                    hasXFactorHistory:
                        xFactorData.hasXFactorHistory

                }),

            marketStatus:
                marketStatus.status,

            marketOpen:
                marketStatus.isOpen,

            exchangeTime:
                quote.exchFeedTime ||
                quote.exchTradeTime ||
                null

        };


        return result;

    }
    catch (error) {

        console.log(
            "TRADE FLOW TRANSFORM ERROR:",
            error.message
        );

        return null;

    }

};


// =====================================================
// GET ACTIVE NSE STOCKS
// =====================================================

const getActiveNSEStocks =
    async () => {

        const instruments =
            await loadInstrumentMaster();


        const equities =
            instruments.filter(
                item => {

                    const exchange =
                        String(
                            item.exch_seg ||
                            ""
                        ).toUpperCase();


                    const symbol =
                        String(
                            item.symbol ||
                            ""
                        ).toUpperCase();


                    return (

                        (
                            exchange === "NSE" ||
                            exchange === "NSE_CM"
                        )

                        &&

                        symbol.endsWith(
                            "-EQ"
                        )

                        &&

                        item.token

                    );

                }
            );


        console.log(
            `TRADE FLOW: ${equities.length} NSE equity instruments found`
        );


        return equities.slice(
            0,
            MAX_STOCKS
        );

    };


// =====================================================
// FETCH ALL STOCKS
// =====================================================

const fetchAllStocks =
    async (
        marketStatus
    ) => {

        const instruments =
            await getActiveNSEStocks();


        const instrumentMap =
            new Map();


        instruments.forEach(
            item => {

                instrumentMap.set(
                    String(item.token),
                    item
                );

            }
        );


        const results = [];


        for (
            let i = 0;
            i < instruments.length;
            i += BATCH_SIZE
        ) {

            const batch =
                instruments.slice(
                    i,
                    i + BATCH_SIZE
                );


            console.log(
                `TRADE FLOW: Scanning ${i + 1}-${Math.min(
                    i + BATCH_SIZE,
                    instruments.length
                )}/${instruments.length}`
            );


            try {

                const quotes =
                    await fetchQuoteBatch(
                        batch
                    );


                const transformed =
                    quotes

                        .map(
                            quote =>
                                transformQuote(
                                    quote,
                                    instrumentMap,
                                    marketStatus
                                )
                        )

                        .filter(
                            stock =>
                                stock &&
                                stock.price > 0
                        );


                results.push(
                    ...transformed
                );

            }
            catch (error) {

                console.log(
                    "TRADE FLOW BATCH ERROR:",
                    error.response?.data ||
                    error.message
                );

            }


            if (
                i + BATCH_SIZE <
                instruments.length
            ) {

                await delay(
                    BATCH_DELAY
                );

            }

        }


        // ==========================================
        // SORT
        // ==========================================

        results.sort(
            (a, b) =>
                b.volume -
                a.volume
        );


        return results.slice(
            0,
            MAX_STOCKS
        );

    };


// =====================================================
// F&O STOCKS
// =====================================================

const getFNOStocks =
    async (
        allStocks
    ) => {

        return allStocks.filter(
            stock =>
                safeNumber(
                    stock.openInterest,
                    0
                ) > 0
        );

    };


// =====================================================
// BUILD TRADE FLOW
// =====================================================

const buildTradeFlow =
    async () => {

        console.log(
            "=========================================="
        );

        console.log(
            "TRADE FLOW: Building fresh market scanner..."
        );


        const marketStatus =
            getMarketStatus();


        console.log(
            "TRADE FLOW MARKET STATUS:",
            marketStatus
        );


        const allStocks =
            await fetchAllStocks(
                marketStatus
            );


        const fnoStocks =
            await getFNOStocks(
                allStocks
            );


        const now =
            Date.now();


        tradeFlowCache = {

            allStocks,

            fnoStocks,

            updatedAt:
                new Date(now),

            expiresAt:
                now + CACHE_DURATION,

            marketStatus

        };


        console.log(
            `TRADE FLOW: Fresh scan completed - ${allStocks.length} stocks`
        );


        console.log(
            `TRADE FLOW: F&O stocks - ${fnoStocks.length}`
        );


        console.log(
            `TRADE FLOW: Cache = ${CACHE_DURATION / 1000}s`
        );


        console.log(
            "=========================================="
        );


        return tradeFlowCache;

    };


// =====================================================
// MAIN TRADE FLOW
// =====================================================

const getTradeFlow =
    async (
        type = "all",
        forceRefresh = false
    ) => {

        const requestedType =
            type === "fno"
                ? "fno"
                : "all";


        const now =
            Date.now();


        // ==========================================
        // CACHE VALID
        // ==========================================

        const cacheValid =
            tradeFlowCache.allStocks.length > 0 &&
            tradeFlowCache.expiresAt > now;


        // ==========================================
        // RETURN CACHE
        // ==========================================

        if (
            cacheValid &&
            !forceRefresh
        ) {

            const stocks =
                requestedType === "fno"
                    ? tradeFlowCache.fnoStocks
                    : tradeFlowCache.allStocks;


            return {

                type:
                    requestedType,

                count:
                    stocks.length,

                updatedAt:
                    tradeFlowCache.updatedAt,

                expiresAt:
                    new Date(
                        tradeFlowCache.expiresAt
                    ),

                marketStatus:
                    tradeFlowCache.marketStatus,

                stocks

            };

        }


        // ==========================================
        // WAIT FOR EXISTING REFRESH
        // ==========================================

        if (
            refreshPromise
        ) {

            console.log(
                "TRADE FLOW: Refresh already running, waiting..."
            );


            await refreshPromise;

        }
        else {

            refreshPromise =
                buildTradeFlow();


            try {

                await refreshPromise;

            }
            finally {

                refreshPromise =
                    null;

            }

        }


        // ==========================================
        // FINAL DATA
        // ==========================================

        const stocks =
            requestedType === "fno"
                ? tradeFlowCache.fnoStocks
                : tradeFlowCache.allStocks;


        return {

            type:
                requestedType,

            count:
                stocks.length,

            updatedAt:
                tradeFlowCache.updatedAt,

            expiresAt:
                new Date(
                    tradeFlowCache.expiresAt
                ),

            marketStatus:
                tradeFlowCache.marketStatus,

            stocks

        };

    };


// =====================================================
// CLEAR CACHE
// =====================================================

const clearTradeFlowCache =
    () => {

        tradeFlowCache = {

            allStocks: [],

            fnoStocks: [],

            updatedAt: null,

            expiresAt: 0,

            marketStatus: {

                isOpen: false,

                status: "CLOSED",

                reason: "Cache cleared"

            }

        };


        // IMPORTANT:
        // snapshots bhi clear kar rahe hain

        volumeSnapshots.clear();


        console.log(
            "TRADE FLOW: Cache + volume snapshots cleared"
        );

    };


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getTradeFlow,

    clearTradeFlowCache

};