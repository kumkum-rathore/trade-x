const {
    getAngelFullQuotes
} = require("./angelOneService");

const {
    loadInstrumentMaster
} = require("./breadthService");


// =====================================================
// CONFIG
// =====================================================

// Cache for browser requests
const CACHE_DURATION = 90 * 1000;

// ✅ NEW: Background snapshot interval (X-Factor jaldi bane)
const BACKGROUND_SNAPSHOT_INTERVAL = 15 * 1000;

const FULL_MASTER_CACHE_DURATION =
    60 * 60 * 1000;


// =====================================================
// IMPORTANT
// =====================================================

// Ab 500 ki limit nahi hai.
// Saare NSE equity instruments scan honge.

const MAX_NSE_STOCKS = Infinity;


// Angel One quote API batch size

const BATCH_SIZE = 50;


// Angel One rate-limit protection

const BATCH_DELAY = 350;


// Top Rockers / Shockers

const TOP_RANKED_STOCKS = 50;


// =====================================================
// ANGEL ONE COMPLETE SCRIP MASTER
// =====================================================

const SCRIP_MASTER_URL =
    "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json";


let fullInstrumentMasterCache = null;

let fullInstrumentMasterExpiresAt = 0;

let fullInstrumentMasterPromise = null;


// =====================================================
// X FACTOR CONFIG
// =====================================================

const X_FACTOR_HISTORY_SIZE = 6;

// ✅ FIX: 2 intervals chahiye (jaldi X-Factor)
// 15s × 2 = 30s me X-Factor ready
const MIN_X_FACTOR_HISTORY = 2;


// =====================================================
// TRADE FLOW CACHE
// =====================================================

let tradeFlowCache = {

    allStocks: [],

    fnoStocks: [],

    rockers: [],

    shockers: [],

    fnoRockers: [],

    fnoShockers: [],

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

const safeNumber = (
    value,
    fallback = 0
) => {

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
// F&O UNDERLYING SYMBOL
// =====================================================

const getFNOUnderlyingSymbol = (
    instrument
) => {

    if (!instrument) {

        return "";

    }


    const name = String(
        instrument.name || ""
    )
        .trim()
        .toUpperCase();


    if (name) {

        return cleanSymbol(name);

    }


    const symbol = String(
        instrument.symbol || ""
    )
        .trim()
        .toUpperCase();


    return cleanSymbol(symbol);

};


// =====================================================
// MARKET STATUS
// =====================================================

const getMarketStatus = () => {

    const now = new Date();


    const parts =
        new Intl.DateTimeFormat(
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

        if (
            part.type !== "literal"
        ) {

            values[part.type] =
                part.value;

        }

    });


    const weekday =
        values.weekday;


    const hour =
        Number(values.hour);


    const minute =
        Number(values.minute);


    const second =
        Number(values.second);


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
        totalSeconds >=
        marketOpenSeconds &&
        totalSeconds <
        marketCloseSeconds;


    if (!isWeekday) {

        return {

            isOpen: false,

            status: "CLOSED",

            reason: "Weekend"

        };

    }


    if (
        totalSeconds <
        marketOpenSeconds
    ) {

        return {

            isOpen: false,

            status: "PRE_OPEN",

            reason:
                "Market opens at 09:15 IST"

        };

    }


    if (
        totalSeconds >=
        marketCloseSeconds
    ) {

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
// AVERAGE
// =====================================================

const calculateAverage = (
    values
) => {

    if (
        !Array.isArray(values) ||
        values.length === 0
    ) {

        return 0;

    }


    const validValues =
        values.filter(
            value =>
                Number.isFinite(
                    Number(value)
                ) &&
                Number(value) > 0
        );


    if (
        validValues.length === 0
    ) {

        return 0;

    }


    const total =
        validValues.reduce(
            (
                sum,
                value
            ) =>
                sum +
                Number(value),
            0
        );


    return (
        total /
        validValues.length
    );

};


// =====================================================
// X FACTOR
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

            averageIntervalVolume: 0,

            historyCount: 0,

            hasXFactorHistory: false

        };

    }


    const previous =
        volumeSnapshots.get(symbol);


    // FIRST SNAPSHOT

    if (!previous) {

        volumeSnapshots.set(
            symbol,
            {

                volume: current,

                intervals: []

            }
        );


        return {

            xFactor: null,

            intervalVolume: 0,

            previousIntervalVolume: 0,

            averageIntervalVolume: 0,

            historyCount: 0,

            hasXFactorHistory: false

        };

    }


    // CURRENT INTERVAL

    const currentIntervalVolume =
        Math.max(
            current -
            previous.volume,
            0
        );


    // NO NEW VOLUME

    if (
        currentIntervalVolume <= 0
    ) {

        volumeSnapshots.set(
            symbol,
            {

                volume: current,

                intervals:
                    previous.intervals

            }
        );


        return {

            xFactor: null,

            intervalVolume: 0,

            previousIntervalVolume:
                previous.intervals.length > 0
                    ? previous.intervals[
                        previous.intervals.length - 1
                    ]
                    : 0,

            averageIntervalVolume:
                calculateAverage(
                    previous.intervals
                ),

            historyCount:
                previous.intervals.length,

            hasXFactorHistory:
                previous.intervals.length >=
                MIN_X_FACTOR_HISTORY

        };

    }


    const oldIntervals =
        Array.isArray(
            previous.intervals
        )
            ? previous.intervals
            : [];


    const averageIntervalVolume =
        calculateAverage(
            oldIntervals
        );


    const previousIntervalVolume =
        oldIntervals.length > 0
            ? oldIntervals[
                oldIntervals.length - 1
            ]
            : 0;


    const updatedIntervals = [

        ...oldIntervals,

        currentIntervalVolume

    ];


    const trimmedIntervals =
        updatedIntervals.slice(
            -X_FACTOR_HISTORY_SIZE
        );


    volumeSnapshots.set(
        symbol,
        {

            volume: current,

            intervals:
                trimmedIntervals

        }
    );


    if (
        oldIntervals.length <
        MIN_X_FACTOR_HISTORY
    ) {

        return {

            xFactor: null,

            intervalVolume:
                currentIntervalVolume,

            previousIntervalVolume,

            averageIntervalVolume,

            historyCount:
                oldIntervals.length,

            hasXFactorHistory: false

        };

    }


    if (
        averageIntervalVolume <= 0
    ) {

        return {

            xFactor: null,

            intervalVolume:
                currentIntervalVolume,

            previousIntervalVolume,

            averageIntervalVolume: 0,

            historyCount:
                oldIntervals.length,

            hasXFactorHistory: false

        };

    }


    const factor =
        currentIntervalVolume /
        averageIntervalVolume;


    if (
        !Number.isFinite(factor) ||
        factor <= 0
    ) {

        return {

            xFactor: null,

            intervalVolume:
                currentIntervalVolume,

            previousIntervalVolume,

            averageIntervalVolume,

            historyCount:
                oldIntervals.length,

            hasXFactorHistory: false

        };

    }


    return {

        xFactor: factor,

        intervalVolume:
            currentIntervalVolume,

        previousIntervalVolume,

        averageIntervalVolume,

        historyCount:
            oldIntervals.length,

        hasXFactorHistory: true

    };

};


// =====================================================
// BUY / SELL PRESSURE
// =====================================================

const calculatePressure = (
    buyQuantity,
    sellQuantity
) => {

    const buy =
        safeNumber(
            buyQuantity,
            0
        );


    const sell =
        safeNumber(
            sellQuantity,
            0
        );


    const total =
        buy + sell;


    if (total <= 0) {

        return {

            buyPressure: 50,

            sellPressure: 50

        };

    }


    return {

        buyPressure:
            (buy / total) * 100,

        sellPressure:
            (sell / total) * 100

    };

};


// =====================================================
// SIGNAL
// =====================================================

const calculateSignal = ({
    changePercent = 0,
    xFactor = null,
    buyQuantity = 0,
    sellQuantity = 0
}) => {

    const change =
        safeNumber(
            changePercent,
            0
        );


    const x =
        Number(xFactor);


    const {
        buyPressure,
        sellPressure
    } =
        calculatePressure(
            buyQuantity,
            sellQuantity
        );


    const validXFactor =
        Number.isFinite(x) &&
        x > 0;


    if (
        validXFactor &&
        x >= 3 &&
        buyPressure >= 60 &&
        change >= 0.50
    ) {

        return "BUY SURGE";

    }


    if (
        validXFactor &&
        x >= 3 &&
        sellPressure >= 60 &&
        change <= -0.50
    ) {

        return "SELL PRESSURE";

    }


    if (
        validXFactor &&
        x >= 4
    ) {

        return "VOLUME SHOCK";

    }


    if (
        validXFactor &&
        x >= 2 &&
        buyPressure >= 60 &&
        change > 0
    ) {

        return "BREAKOUT";

    }


    if (
        validXFactor &&
        x >= 2 &&
        sellPressure >= 60 &&
        change < 0
    ) {

        return "BREAKDOWN";

    }


    if (
        change >= 2
    ) {

        return "MOMENTUM";

    }


    if (
        change <= -2
    ) {

        return "WEAKNESS";

    }


    return "NEUTRAL";

};


// =====================================================
// LOAD COMPLETE ANGEL MASTER
// =====================================================

const loadCompleteInstrumentMaster =
    async () => {

        const now =
            Date.now();


        if (
            fullInstrumentMasterCache &&
            fullInstrumentMasterExpiresAt > now
        ) {

            return fullInstrumentMasterCache;

        }


        if (
            fullInstrumentMasterPromise
        ) {

            return await fullInstrumentMasterPromise;

        }


        fullInstrumentMasterPromise =
            (async () => {

                console.log(
                    "TRADE FLOW: Downloading complete Angel One Scrip Master..."
                );


                const response =
                    await fetch(
                        SCRIP_MASTER_URL
                    );


                if (!response.ok) {

                    throw new Error(
                        `Angel Scrip Master HTTP ${response.status}`
                    );

                }


                const data =
                    await response.json();


                if (
                    !Array.isArray(data)
                ) {

                    throw new Error(
                        "Angel Scrip Master returned invalid data"
                    );

                }


                fullInstrumentMasterCache =
                    data;


                fullInstrumentMasterExpiresAt =
                    Date.now() +
                    FULL_MASTER_CACHE_DURATION;


                console.log(
                    `TRADE FLOW: Complete Scrip Master loaded - ${data.length} instruments`
                );


                return data;

            })();


        try {

            return await fullInstrumentMasterPromise;

        }

        finally {

            fullInstrumentMasterPromise =
                null;

        }

    };


// =====================================================
// FETCH QUOTE BATCH
// =====================================================

const fetchQuoteBatch = async (
    instruments,
    exchange = "NSE"
) => {

    const exchangeTokens = {

        [exchange]:
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
                quote.symbolToken ||
                ""
            );


        const instrument =
            instrumentMap.get(
                token
            );


        const exchange =
            String(
                quote.exchSegment ||
                instrument?.exch_seg ||
                "UNKNOWN"
            ).toUpperCase();


        let symbol;


        if (
            exchange === "NFO"
        ) {

            symbol =
                getFNOUnderlyingSymbol(
                    instrument
                );

        }

        else {

            symbol =
                cleanSymbol(
                    instrument?.symbol ||
                    quote.tradingSymbol
                );

        }


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


        const buyQuantity =
            safeNumber(
                quote.totBuyQuan,
                0
            );


        const sellQuantity =
            safeNumber(
                quote.totSellQuan,
                0
            );


        const {
            buyPressure,
            sellPressure
        } =
            calculatePressure(
                buyQuantity,
                sellQuantity
            );


        let xFactorData = {

            xFactor: null,

            intervalVolume: 0,

            previousIntervalVolume: 0,

            averageIntervalVolume: 0,

            historyCount: 0,

            hasXFactorHistory: false

        };


        if (
            marketStatus.isOpen
        ) {

            xFactorData =
                calculateXFactor(
                    `${exchange}_${token}`,
                    volume
                );

        }


        const signal =
            calculateSignal({

                changePercent:
                    percentChange,

                xFactor:
                    xFactorData.xFactor,

                buyQuantity,

                sellQuantity

            });


        return {

            symbol,

            name:
                instrument?.name ||
                symbol,

            tradingSymbol:
                quote.tradingSymbol ||
                instrument?.symbol ||
                symbol,

            token,

            exchange,

            price,

            value:
                price,

            change:
                safeNumber(
                    quote.netChange,
                    0
                ),

            changePercent:
                Number(
                    percentChange.toFixed(2)
                ),


            // VOLUME

            volume,

            intervalVolume:
                xFactorData.intervalVolume,

            previousIntervalVolume:
                xFactorData.previousIntervalVolume,

            averageIntervalVolume:
                xFactorData.averageIntervalVolume,

            xFactorHistoryCount:
                xFactorData.historyCount,

            hasXFactorHistory:
                xFactorData.hasXFactorHistory,


            // PRICE DATA

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


            // BUY SELL

            buyQuantity,

            sellQuantity,

            buyPressure:
                Number(
                    buyPressure.toFixed(2)
                ),

            sellPressure:
                Number(
                    sellPressure.toFixed(2)
                ),


            // OPEN INTEREST

            openInterest:
                safeNumber(
                    quote.opnInterest,
                    0
                ),


            // X FACTOR

            xFactor:
                xFactorData.xFactor === null
                    ? null
                    : Number(
                        xFactorData.xFactor.toFixed(2)
                    ),


            // SIGNAL

            signal,


            // MARKET

            marketStatus:
                marketStatus.status,

            marketOpen:
                marketStatus.isOpen,


            // TIME

            exchangeTime:
                quote.exchFeedTime ||
                quote.exchTradeTime ||
                null

        };

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
// NORMALIZE VALUE 0-100
// =====================================================

const normalizeValue = (
    value,
    min,
    max
) => {

    const number =
        safeNumber(
            value,
            0
        );


    if (
        max <= min
    ) {

        return 0;

    }


    const normalized =
        (
            (number - min) /
            (max - min)
        ) * 100;


    return Math.max(
        0,
        Math.min(
            100,
            normalized
        )
    );

};


// =====================================================
// BUILD RANKING DATA
// =====================================================

const buildRankingData = (
    stocks
) => {

    if (
        !Array.isArray(stocks) ||
        stocks.length === 0
    ) {

        return [];

    }


    const volumes =
        stocks
            .map(
                stock =>
                    safeNumber(
                        stock.volume,
                        0
                    )
            )
            .filter(
                value =>
                    value > 0
            );


    const changes =
        stocks.map(
            stock =>
                Math.abs(
                    safeNumber(
                        stock.changePercent,
                        0
                    )
                )
        );


    const xFactors =
        stocks
            .map(
                stock =>
                    safeNumber(
                        stock.xFactor,
                        0
                    )
            )
            .filter(
                value =>
                    value > 0
            );


    const minVolume =
        volumes.length
            ? Math.min(...volumes)
            : 0;


    const maxVolume =
        volumes.length
            ? Math.max(...volumes)
            : 0;


    const minChange =
        changes.length
            ? Math.min(...changes)
            : 0;


    const maxChange =
        changes.length
            ? Math.max(...changes)
            : 0;


    const minX =
        xFactors.length
            ? Math.min(...xFactors)
            : 0;


    const maxX =
        xFactors.length
            ? Math.max(...xFactors)
            : 0;


    const hasAnyXFactor =
        xFactors.length > 0 &&
        maxX > minX;


    return stocks.map(stock => {

        const volume =
            safeNumber(
                stock.volume,
                0
            );


        const change =
            Math.abs(
                safeNumber(
                    stock.changePercent,
                    0
                )
            );


        const xFactor =
            safeNumber(
                stock.xFactor,
                0
            );


        const volumeRank =
            normalizeValue(
                volume,
                minVolume,
                maxVolume
            );


        const changeRank =
            normalizeValue(
                change,
                minChange,
                maxChange
            );


        const xFactorRank =
            hasAnyXFactor
                ? normalizeValue(
                    xFactor,
                    minX,
                    maxX
                )
                : 0;


        let rankingScore;


        if (hasAnyXFactor) {

            rankingScore =
                (volumeRank * 0.40) +
                (changeRank * 0.35) +
                (xFactorRank * 0.25);

        }

        else {

            rankingScore =
                (volumeRank * (0.40 / 0.75)) +
                (changeRank * (0.35 / 0.75));

        }


        return {

            ...stock,

            volumeRank:
                Number(
                    volumeRank.toFixed(2)
                ),

            changeRank:
                Number(
                    changeRank.toFixed(2)
                ),

            xFactorRank:
                Number(
                    xFactorRank.toFixed(2)
                ),

            rankingScore:
                Number(
                    rankingScore.toFixed(2)
                )

        };

    });

};


// =====================================================
// MARKET ROCKERS
// =====================================================

const buildMarketRockers = (
    stocks
) => {

    if (
        !Array.isArray(stocks)
    ) {

        return [];

    }


    const positiveStocks =
        stocks.filter(
            stock =>
                safeNumber(
                    stock.changePercent,
                    0
                ) > 0
        );


    if (
        positiveStocks.length === 0
    ) {

        return [];

    }


    const rankedStocks =
        buildRankingData(
            positiveStocks
        );


    rankedStocks.sort(
        (a, b) => {

            if (
                b.rankingScore !==
                a.rankingScore
            ) {

                return (
                    b.rankingScore -
                    a.rankingScore
                );

            }


            if (
                b.changePercent !==
                a.changePercent
            ) {

                return (
                    b.changePercent -
                    a.changePercent
                );

            }


            if (
                safeNumber(b.xFactor, 0) !==
                safeNumber(a.xFactor, 0)
            ) {

                return (
                    safeNumber(b.xFactor, 0) -
                    safeNumber(a.xFactor, 0)
                );

            }


            return (
                safeNumber(b.volume, 0) -
                safeNumber(a.volume, 0)
            );

        }
    );


    return rankedStocks.slice(
        0,
        TOP_RANKED_STOCKS
    );

};


// =====================================================
// MARKET SHOCKERS
// =====================================================

const buildMarketShockers = (
    stocks
) => {

    if (
        !Array.isArray(stocks)
    ) {

        return [];

    }


    const negativeStocks =
        stocks.filter(
            stock =>
                safeNumber(
                    stock.changePercent,
                    0
                ) < 0
        );


    if (
        negativeStocks.length === 0
    ) {

        return [];

    }


    const rankedStocks =
        buildRankingData(
            negativeStocks
        );


    rankedStocks.sort(
        (a, b) => {

            if (
                b.rankingScore !==
                a.rankingScore
            ) {

                return (
                    b.rankingScore -
                    a.rankingScore
                );

            }


            if (
                a.changePercent !==
                b.changePercent
            ) {

                return (
                    a.changePercent -
                    b.changePercent
                );

            }


            if (
                safeNumber(b.xFactor, 0) !==
                safeNumber(a.xFactor, 0)
            ) {

                return (
                    safeNumber(b.xFactor, 0) -
                    safeNumber(a.xFactor, 0)
                );

            }


            return (
                safeNumber(b.volume, 0) -
                safeNumber(a.volume, 0)
            );

        }
    );


    return rankedStocks.slice(
        0,
        TOP_RANKED_STOCKS
    );

};


// =====================================================
// GET ALL ACTIVE NSE EQUITY STOCKS
// =====================================================

const getActiveNSEStocks = async () => {

    const instruments = await loadInstrumentMaster();

    if (!Array.isArray(instruments)) {

        console.log(
            "TRADE FLOW: Instrument master is not an array"
        );

        return [];

    }

    const equities = instruments.filter(item => {

        const exchange = String(
            item.exch_seg || ""
        ).toUpperCase();

        const symbol = String(
            item.symbol || ""
        ).toUpperCase();

        const token = String(
            item.token || ""
        ).trim();

        return (

            exchange === "NSE" &&

            symbol.endsWith("-EQ") &&

            token

        );

    });

    console.log(
        `TRADE FLOW: ${equities.length} NSE equity instruments found`
    );

    return equities;

};


// =====================================================
// FETCH ALL NSE STOCKS
// =====================================================

const fetchAllStocks = async (marketStatus) => {

    const instruments = await getActiveNSEStocks();

    console.log(
        `TRADE FLOW: Starting full NSE scan of ${instruments.length} stocks`
    );

    if (instruments.length === 0) {

        return [];

    }

    const instrumentMap = new Map();

    instruments.forEach(item => {

        instrumentMap.set(
            String(item.token),
            item
        );

    });

    const results = [];

    for (
        let i = 0;
        i < instruments.length;
        i += BATCH_SIZE
    ) {

        const batch = instruments.slice(
            i,
            i + BATCH_SIZE
        );

        const batchEnd = Math.min(
            i + BATCH_SIZE,
            instruments.length
        );

        console.log(
            `TRADE FLOW: Scanning ${i + 1}-${batchEnd}/${instruments.length}`
        );

        try {

            const quotes = await fetchQuoteBatch(
                batch,
                "NSE"
            );

            const transformed = quotes
                .map(quote =>
                    transformQuote(
                        quote,
                        instrumentMap,
                        marketStatus
                    )
                )
                .filter(stock =>
                    stock &&
                    stock.price > 0
                );

            results.push(...transformed);

        }
        catch (error) {

            console.log(
                "TRADE FLOW NSE BATCH ERROR:",
                error.response?.data ||
                error.message
            );

        }

        if (
            i + BATCH_SIZE <
            instruments.length
        ) {

            await delay(BATCH_DELAY);

        }

    }

    console.log(
        "=========================================="
    );

    console.log(
        `TRADE FLOW: FULL NSE SCAN COMPLETED`
    );

    console.log(
        `TRADE FLOW: Instruments scanned = ${instruments.length}`
    );

    console.log(
        `TRADE FLOW: Valid quotes received = ${results.length}`
    );

    console.log(
        "=========================================="
    );

    return results;

};


// =====================================================
// PARSE EXPIRY
// =====================================================

const parseExpiry = (
    expiry
) => {

    if (!expiry) {

        return null;

    }


    const value =
        String(
            expiry
        )
            .trim()
            .toUpperCase();


    const match =
        value.match(
            /^(\d{2})([A-Z]{3})(\d{4})$/
        );


    if (match) {

        const day =
            Number(
                match[1]
            );


        const monthMap = {

            JAN: 0,
            FEB: 1,
            MAR: 2,
            APR: 3,
            MAY: 4,
            JUN: 5,
            JUL: 6,
            AUG: 7,
            SEP: 8,
            OCT: 9,
            NOV: 10,
            DEC: 11

        };


        const month =
            monthMap[
                match[2]
            ];


        const year =
            Number(
                match[3]
            );


        if (
            month === undefined
        ) {

            return null;

        }


        const date =
            new Date(
                year,
                month,
                day
            );


        date.setHours(
            0,
            0,
            0,
            0
        );


        return date;

    }


    const date =
        new Date(
            expiry
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date;

};


// =====================================================
// GET REAL F&O STOCKS
// =====================================================

const getFNOStocks =
    async (
        marketStatus
    ) => {

        try {

            const instruments =
                await loadCompleteInstrumentMaster();


            const today =
                new Date();


            today.setHours(
                0,
                0,
                0,
                0
            );


            const nfoInstruments =
                instruments.filter(
                    item =>
                        String(
                            item.exch_seg || ""
                        ).toUpperCase() ===
                        "NFO"
                );


            const futStkInstruments =
                nfoInstruments.filter(
                    item =>
                        String(
                            item.instrumenttype || ""
                        ).toUpperCase() ===
                        "FUTSTK"
                );


            const futures =
                futStkInstruments.filter(
                    item => {

                        const expiry =
                            parseExpiry(
                                item.expiry
                            );


                        return (

                            item.token &&

                            item.symbol &&

                            expiry &&

                            expiry >= today

                        );

                    }
                );


            if (
                futures.length === 0
            ) {

                console.log(
                    "TRADE FLOW: No valid future contracts found"
                );


                return [];

            }


            futures.sort(
                (a, b) => {

                    const expiryA =
                        parseExpiry(
                            a.expiry
                        );


                    const expiryB =
                        parseExpiry(
                            b.expiry
                        );


                    return (
                        expiryA.getTime() -
                        expiryB.getTime()
                    );

                }
            );


            const nearestExpiry =
                parseExpiry(
                    futures[0].expiry
                );


            const nearestExpiryFutures =
                futures.filter(
                    item => {

                        const expiry =
                            parseExpiry(
                                item.expiry
                            );


                        return (

                            expiry &&

                            expiry.getTime() ===
                            nearestExpiry.getTime()

                        );

                    }
                );


            console.log(
                `TRADE FLOW: ${nearestExpiryFutures.length} NFO FUTSTK contracts found for nearest expiry ${nearestExpiryFutures[0]?.expiry}`
            );


            const instrumentMap =
                new Map();


            nearestExpiryFutures.forEach(
                item => {

                    instrumentMap.set(

                        String(
                            item.token
                        ),

                        item

                    );

                }
            );


            const results = [];


            for (
                let i = 0;
                i < nearestExpiryFutures.length;
                i += BATCH_SIZE
            ) {

                const batch =
                    nearestExpiryFutures.slice(
                        i,
                        i + BATCH_SIZE
                    );


                try {

                    const quotes =
                        await fetchQuoteBatch(
                            batch,
                            "NFO"
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
                        "TRADE FLOW F&O BATCH ERROR:",
                        error.response?.data ||
                        error.message
                    );

                }


                if (
                    i + BATCH_SIZE <
                    nearestExpiryFutures.length
                ) {

                    await delay(
                        BATCH_DELAY
                    );

                }

            }


            results.sort(
                (a, b) => {

                    const volumeDifference =
                        safeNumber(b.volume, 0) -
                        safeNumber(a.volume, 0);


                    if (
                        volumeDifference !== 0
                    ) {

                        return volumeDifference;

                    }


                    return (
                        safeNumber(b.openInterest, 0) -
                        safeNumber(a.openInterest, 0)
                    );

                }
            );


            return results.slice(
                0,
                TOP_RANKED_STOCKS
            );

        }

        catch (error) {

            console.log(
                "TRADE FLOW F&O ERROR:",
                error.message
            );


            return [];

        }

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
            "TRADE FLOW: Building FULL market scanner..."
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


        const rockers =
            buildMarketRockers(
                allStocks
            );


        const shockers =
            buildMarketShockers(
                allStocks
            );


        const fnoStocks =
            await getFNOStocks(
                marketStatus
            );


        const fnoRockers =
            buildMarketRockers(
                fnoStocks
            );


        const fnoShockers =
            buildMarketShockers(
                fnoStocks
            );


        const now =
            Date.now();


        tradeFlowCache = {

            allStocks,

            fnoStocks,

            rockers,

            shockers,

            fnoRockers,

            fnoShockers,

            updatedAt:
                new Date(now),

            expiresAt:
                now +
                CACHE_DURATION,

            marketStatus

        };


        console.log(
            "=========================================="
        );


        console.log(
            "TRADE FLOW FINAL RESULT"
        );


        console.log(
            `ALL NSE SCANNED: ${allStocks.length}`
        );


        console.log(
            `TOP MARKET ROCKERS: ${rockers.length}`
        );


        console.log(
            `TOP MARKET SHOCKERS: ${shockers.length}`
        );


        console.log(
            `F&O STOCKS: ${fnoStocks.length}`
        );


        console.log(
            `F&O ROCKERS: ${fnoRockers.length}`
        );


        console.log(
            `F&O SHOCKERS: ${fnoShockers.length}`
        );


        console.log(
            `CACHE: ${CACHE_DURATION / 1000}s`
        );


        console.log(
            "=========================================="
        );


        return tradeFlowCache;

    };


// =====================================================
// GET TRADE FLOW
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


        const cacheValid =
            tradeFlowCache.allStocks.length > 0 &&
            tradeFlowCache.expiresAt > now;


        // =================================================
        // CACHE
        // =================================================

        if (
            cacheValid &&
            !forceRefresh
        ) {

            const stocks =
                requestedType === "fno"
                    ? tradeFlowCache.fnoStocks
                    : tradeFlowCache.allStocks;


            const rockers =
                requestedType === "fno"
                    ? tradeFlowCache.fnoRockers
                    : tradeFlowCache.rockers;


            const shockers =
                requestedType === "fno"
                    ? tradeFlowCache.fnoShockers
                    : tradeFlowCache.shockers;


            return {

                type:
                    requestedType,

                count:
                    stocks.length,

                scannedCount:
                    tradeFlowCache.allStocks.length,

                updatedAt:
                    tradeFlowCache.updatedAt,

                expiresAt:
                    new Date(
                        tradeFlowCache.expiresAt
                    ),

                marketStatus:
                    tradeFlowCache.marketStatus,

                stocks,

                rockers,

                shockers

            };

        }


        // =================================================
        // REFRESH LOCK
        // =================================================

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


        // =================================================
        // FINAL DATA
        // =================================================

        const stocks =
            requestedType === "fno"
                ? tradeFlowCache.fnoStocks
                : tradeFlowCache.allStocks;


        const rockers =
            requestedType === "fno"
                ? tradeFlowCache.fnoRockers
                : tradeFlowCache.rockers;


        const shockers =
            requestedType === "fno"
                ? tradeFlowCache.fnoShockers
                : tradeFlowCache.shockers;


        return {

            type:
                requestedType,

            count:
                stocks.length,

            scannedCount:
                tradeFlowCache.allStocks.length,

            updatedAt:
                tradeFlowCache.updatedAt,

            expiresAt:
                new Date(
                    tradeFlowCache.expiresAt
                ),

            marketStatus:
                tradeFlowCache.marketStatus,

            stocks,

            rockers,

            shockers

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

            rockers: [],

            shockers: [],

            fnoRockers: [],

            fnoShockers: [],

            updatedAt: null,

            expiresAt: 0,

            marketStatus: {

                isOpen: false,

                status: "CLOSED",

                reason: "Cache cleared"

            }

        };


        volumeSnapshots.clear();


        fullInstrumentMasterCache =
            null;


        fullInstrumentMasterExpiresAt =
            0;


        console.log(
            "TRADE FLOW: Cache + volume snapshots + master cache cleared"
        );

    };


// =====================================================
// BACKGROUND SNAPSHOTTER
// =====================================================
//
// Har 15s me NSE stocks ka snapshot leta hai taaki
// X-Factor history jaldi bane. Frontend ke request
// aane ka wait nahi karta.
//
// Sirf market hours me chalta hai.
//

let backgroundTimer = null;

let backgroundRunning = false;


const runBackgroundSnapshot = async () => {

    if (backgroundRunning) {

        return;

    }


    const marketStatus = getMarketStatus();


    // Market closed → skip

    if (!marketStatus.isOpen) {

        return;

    }


    backgroundRunning = true;


    try {

        console.log(
            "TRADE FLOW BG: Taking X-Factor snapshot..."
        );


        const instruments =
            await getActiveNSEStocks();


        if (instruments.length === 0) {

            return;

        }


        // Sirf volume snapshot lo — ranking nahi
        // (fast hai, har 15s chal sakta hai)

        for (
            let i = 0;
            i < instruments.length;
            i += BATCH_SIZE
        ) {

            const batch = instruments.slice(
                i,
                i + BATCH_SIZE
            );


            try {

                const quotes =
                    await fetchQuoteBatch(
                        batch,
                        "NSE"
                    );


                quotes.forEach(quote => {

                    const token = String(
                        quote.symbolToken || ""
                    );


                    const volume = safeNumber(
                        quote.tradeVolume,
                        0
                    );


                    if (
                        token &&
                        volume > 0
                    ) {

                        // X-Factor history me snapshot daalta hai

                        calculateXFactor(
                            `NSE_${token}`,
                            volume
                        );

                    }

                });

            }

            catch (error) {

                console.log(
                    "TRADE FLOW BG BATCH ERROR:",
                    error.message
                );

            }


            await delay(BATCH_DELAY);

        }


        console.log(
            "TRADE FLOW BG: Snapshot done"
        );

    }

    catch (error) {

        console.log(
            "TRADE FLOW BG ERROR:",
            error.message
        );

    }

    finally {

        backgroundRunning = false;

    }

};


// =====================================================
// START BACKGROUND SNAPSHOTTER
// =====================================================

const startBackgroundSnapshotter = () => {

    if (backgroundTimer) {

        return;

    }


    console.log(
        `TRADE FLOW: Background snapshotter started (${BACKGROUND_SNAPSHOT_INTERVAL / 1000}s)`
    );


    // Pehla run 5s baad (server startup stabilization)

    setTimeout(
        runBackgroundSnapshot,
        5000
    );


    // Fir har 15s me

    backgroundTimer = setInterval(
        runBackgroundSnapshot,
        BACKGROUND_SNAPSHOT_INTERVAL
    );

};


// =====================================================
// AUTO-START on module load
// =====================================================

startBackgroundSnapshotter();


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getTradeFlow,

    clearTradeFlowCache

};