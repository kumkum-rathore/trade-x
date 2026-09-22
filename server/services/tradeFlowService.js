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

const FULL_MASTER_CACHE_DURATION = 60 * 60 * 1000;

const MAX_STOCKS = 500;

const BATCH_SIZE = 50;

const BATCH_DELAY = 1100;


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

const MIN_X_FACTOR_HISTORY = 3;


// =====================================================
// ROCKERS / SHOCKERS CONFIG
// =====================================================

const TOP_RANKED_STOCKS = 50;


// =====================================================
// CACHE
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


    // Angel master ka `name`
    // normally underlying symbol hota hai.

    const name = String(
        instrument.name || ""
    )
        .trim()
        .toUpperCase();

    if (name) {

        return cleanSymbol(name);

    }


    // Fallback

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

            averageIntervalVolume: 0,

            historyCount: 0,

            hasXFactorHistory: false

        };

    }


    const previous =
        volumeSnapshots.get(symbol);


    // =================================================
    // FIRST SNAPSHOT
    // =================================================

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


    // =================================================
    // CURRENT INTERVAL VOLUME
    // =================================================

    const currentIntervalVolume =
        Math.max(
            current -
            previous.volume,
            0
        );


    // =================================================
    // VOLUME DID NOT INCREASE
    // =================================================

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


    // =================================================
    // OLD HISTORY
    // =================================================

    const oldIntervals =
        Array.isArray(
            previous.intervals
        )
            ? previous.intervals
            : [];


    // =================================================
    // BASELINE
    // =================================================

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


    // =================================================
    // ADD CURRENT INTERVAL
    // =================================================

    const updatedIntervals = [

        ...oldIntervals,

        currentIntervalVolume

    ];


    const trimmedIntervals =
        updatedIntervals.slice(
            -X_FACTOR_HISTORY_SIZE
        );


    // =================================================
    // SAVE SNAPSHOT
    // =================================================

    volumeSnapshots.set(
        symbol,
        {

            volume: current,

            intervals:
                trimmedIntervals

        }
    );


    // =================================================
    // NOT ENOUGH HISTORY
    // =================================================

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


    // =================================================
    // INVALID BASELINE
    // =================================================

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


    // =================================================
    // X FACTOR
    // =================================================

    const factor =
        currentIntervalVolume /
        averageIntervalVolume;


    // =================================================
    // VALIDATE
    // =================================================

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


    // BUY SURGE

    if (
        validXFactor &&
        x >= 3 &&
        buyPressure >= 60 &&
        change >= 0.50
    ) {

        return "BUY SURGE";

    }


    // SELL PRESSURE

    if (
        validXFactor &&
        x >= 3 &&
        sellPressure >= 60 &&
        change <= -0.50
    ) {

        return "SELL PRESSURE";

    }


    // VOLUME SHOCK

    if (
        validXFactor &&
        x >= 4
    ) {

        return "VOLUME SHOCK";

    }


    // BREAKOUT

    if (
        validXFactor &&
        x >= 2 &&
        buyPressure >= 60 &&
        change > 0
    ) {

        return "BREAKOUT";

    }


    // BREAKDOWN

    if (
        validXFactor &&
        x >= 2 &&
        sellPressure >= 60 &&
        change < 0
    ) {

        return "BREAKDOWN";

    }


    // MOMENTUM

    if (
        change >= 2
    ) {

        return "MOMENTUM";

    }


    // WEAKNESS

    if (
        change <= -2
    ) {

        return "WEAKNESS";

    }


    return "NEUTRAL";

};


// =====================================================
// FETCH COMPLETE ANGEL ONE MASTER
// =====================================================

const loadCompleteInstrumentMaster =
    async () => {

        const now =
            Date.now();


        // =================================================
        // VALID CACHE
        // =================================================

        if (
            fullInstrumentMasterCache &&
            fullInstrumentMasterExpiresAt > now
        ) {

            return fullInstrumentMasterCache;

        }


        // =================================================
        // WAIT FOR EXISTING DOWNLOAD
        // =================================================

        if (
            fullInstrumentMasterPromise
        ) {

            return await fullInstrumentMasterPromise;

        }


        // =================================================
        // DOWNLOAD
        // =================================================

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


                const nseCount =
                    data.filter(
                        item =>
                            String(
                                item.exch_seg || ""
                            ).toUpperCase() ===
                            "NSE"
                    ).length;


                const nfoCount =
                    data.filter(
                        item =>
                            String(
                                item.exch_seg || ""
                            ).toUpperCase() ===
                            "NFO"
                    ).length;


                const futStkCount =
                    data.filter(
                        item =>
                            String(
                                item.exch_seg || ""
                            ).toUpperCase() ===
                            "NFO" &&
                            String(
                                item.instrumenttype || ""
                            ).toUpperCase() ===
                            "FUTSTK"
                    ).length;


                console.log(
                    "=========================================="
                );

                console.log(
                    "COMPLETE MASTER DEBUG"
                );

                console.log(
                    "TOTAL INSTRUMENTS:",
                    data.length
                );

                console.log(
                    "NSE INSTRUMENTS:",
                    nseCount
                );

                console.log(
                    "NFO INSTRUMENTS:",
                    nfoCount
                );

                console.log(
                    "NFO FUTSTK:",
                    futStkCount
                );

                console.log(
                    "=========================================="
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

        // =================================================
        // TOKEN
        // =================================================

        const token =
            String(
                quote.symbolToken ||
                ""
            );


        // =================================================
        // INSTRUMENT
        // =================================================

        const instrument =
            instrumentMap.get(
                token
            );


        // =================================================
        // EXCHANGE
        // =================================================

        const exchange =
            String(
                quote.exchSegment ||
                instrument?.exch_seg ||
                "UNKNOWN"
            ).toUpperCase();


        // =================================================
        // SYMBOL
        // =================================================

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


        // =================================================
        // PRICE
        // =================================================

        const price =
            safeNumber(
                quote.ltp,
                0
            );


        // =================================================
        // CHANGE %
        // =================================================

        const percentChange =
            safeNumber(
                quote.percentChange,
                0
            );


        // =================================================
        // VOLUME
        // =================================================

        const volume =
            safeNumber(
                quote.tradeVolume,
                0
            );


        // =================================================
        // BUY QUANTITY
        // =================================================

        const buyQuantity =
            safeNumber(
                quote.totBuyQuan,
                0
            );


        // =================================================
        // SELL QUANTITY
        // =================================================

        const sellQuantity =
            safeNumber(
                quote.totSellQuan,
                0
            );


        // =================================================
        // PRESSURE
        // =================================================

        const {
            buyPressure,
            sellPressure
        } =
            calculatePressure(
                buyQuantity,
                sellQuantity
            );


        // =================================================
        // X FACTOR
        // =================================================

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


        // =================================================
        // SIGNAL
        // =================================================

        const signal =
            calculateSignal({

                changePercent:
                    percentChange,

                xFactor:
                    xFactorData.xFactor,

                buyQuantity,

                sellQuantity

            });


        // =================================================
        // RESULT
        // =================================================

        const result = {

            symbol,

            name:
                exchange === "NFO"
                    ? (
                        instrument?.name ||
                        symbol
                    )
                    : (
                        instrument?.name ||
                        symbol
                    ),

            tradingSymbol:
                quote.tradingSymbol ||
                instrument?.symbol ||
                symbol,

            token,

            exchange,

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


            // =================================================
            // VOLUME
            // =================================================

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


            // =================================================
            // PRICE DATA
            // =================================================

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


            // =================================================
            // BUY / SELL
            // =================================================

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


            // =================================================
            // OPEN INTEREST
            // =================================================

            openInterest:
                safeNumber(
                    quote.opnInterest,
                    0
                ),


            // =================================================
            // X FACTOR
            // =================================================

            xFactor:
                xFactorData.xFactor === null

                    ? null

                    : Number(
                        xFactorData.xFactor.toFixed(2)
                    ),


            // =================================================
            // SIGNAL
            // =================================================

            signal,


            // =================================================
            // MARKET STATUS
            // =================================================

            marketStatus:
                marketStatus.status,

            marketOpen:
                marketStatus.isOpen,


            // =================================================
            // EXCHANGE TIME
            // =================================================

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
// ROCKER SCORE
// =====================================================

const calculateRockerScore = (
    stock
) => {

    const change =
        safeNumber(
            stock.changePercent,
            0
        );


    const x =
        safeNumber(
            stock.xFactor,
            0
        );


    const buyPressure =
        safeNumber(
            stock.buyPressure,
            50
        );


    if (
        change <= 0
    ) {

        return 0;

    }


    // PRICE

    const priceScore =
        Math.min(
            change,
            10
        ) * 5;


    // X FACTOR

    const xFactorScore =
        x > 0
            ? Math.min(
                x,
                10
            ) * 3
            : 0;


    // BUY PRESSURE

    const buyScore =
        Math.max(
            0,
            buyPressure - 50
        ) * 0.5;


    // SIGNAL BONUS

    let signalBonus = 0;


    if (
        stock.signal ===
        "BUY SURGE"
    ) {

        signalBonus = 25;

    }

    else if (
        stock.signal ===
        "BREAKOUT"
    ) {

        signalBonus = 18;

    }

    else if (
        stock.signal ===
        "MOMENTUM"
    ) {

        signalBonus = 10;

    }

    else if (
        stock.signal ===
        "VOLUME SHOCK"
    ) {

        signalBonus = 8;

    }


    return Number(
        (
            priceScore +
            xFactorScore +
            buyScore +
            signalBonus
        ).toFixed(2)
    );

};


// =====================================================
// SHOCKER SCORE
// =====================================================

const calculateShockerScore = (
    stock
) => {

    const change =
        safeNumber(
            stock.changePercent,
            0
        );


    const x =
        safeNumber(
            stock.xFactor,
            0
        );


    const sellPressure =
        safeNumber(
            stock.sellPressure,
            50
        );


    if (
        change >= 0
    ) {

        return 0;

    }


    // PRICE

    const priceScore =
        Math.min(
            Math.abs(change),
            10
        ) * 5;


    // X FACTOR

    const xFactorScore =
        x > 0
            ? Math.min(
                x,
                10
            ) * 3
            : 0;


    // SELL PRESSURE

    const sellScore =
        Math.max(
            0,
            sellPressure - 50
        ) * 0.5;


    // SIGNAL BONUS

    let signalBonus = 0;


    if (
        stock.signal ===
        "SELL PRESSURE"
    ) {

        signalBonus = 25;

    }

    else if (
        stock.signal ===
        "BREAKDOWN"
    ) {

        signalBonus = 18;

    }

    else if (
        stock.signal ===
        "WEAKNESS"
    ) {

        signalBonus = 10;

    }

    else if (
        stock.signal ===
        "VOLUME SHOCK"
    ) {

        signalBonus = 8;

    }


    return Number(
        (
            priceScore +
            xFactorScore +
            sellScore +
            signalBonus
        ).toFixed(2)
    );

};


// =====================================================
// BUILD ROCKERS
// =====================================================

const buildMarketRockers = (
    stocks
) => {

    if (
        !Array.isArray(stocks)
    ) {

        return [];

    }


    const rockers =
        stocks

            .map(stock => {

                const score =
                    calculateRockerScore(
                        stock
                    );


                return {

                    ...stock,

                    rockerScore:
                        score

                };

            })

            .filter(
                stock =>
                    stock.rockerScore > 0
            );


    rockers.sort(
        (a, b) => {

            if (
                b.rockerScore !==
                a.rockerScore
            ) {

                return (
                    b.rockerScore -
                    a.rockerScore
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


            return (
                safeNumber(
                    b.xFactor,
                    0
                ) -
                safeNumber(
                    a.xFactor,
                    0
                )
            );

        }
    );


    return rockers.slice(
        0,
        TOP_RANKED_STOCKS
    );

};


// =====================================================
// BUILD SHOCKERS
// =====================================================

const buildMarketShockers = (
    stocks
) => {

    if (
        !Array.isArray(stocks)
    ) {

        return [];

    }


    const shockers =
        stocks

            .map(stock => {

                const score =
                    calculateShockerScore(
                        stock
                    );


                return {

                    ...stock,

                    shockerScore:
                        score

                };

            })

            .filter(
                stock =>
                    stock.shockerScore > 0
            );


    shockers.sort(
        (a, b) => {

            if (
                b.shockerScore !==
                a.shockerScore
            ) {

                return (
                    b.shockerScore -
                    a.shockerScore
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


            return (
                safeNumber(
                    b.xFactor,
                    0
                ) -
                safeNumber(
                    a.xFactor,
                    0
                )
            );

        }
    );


    return shockers.slice(
        0,
        TOP_RANKED_STOCKS
    );

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
                            exchange ===
                            "NSE" ||

                            exchange ===
                            "NSE_CM"
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
// FETCH ALL NSE STOCKS
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

                    String(
                        item.token
                    ),

                    item

                );

            }
        );


        const results = [];


        // =================================================
        // BATCH LOOP
        // =================================================

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
                        batch,
                        "NSE"
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
                    "TRADE FLOW NSE BATCH ERROR:",
                    error.response?.data ||
                    error.message
                );

            }


            // Angel One rate limit

            if (
                i + BATCH_SIZE <
                instruments.length
            ) {

                await delay(
                    BATCH_DELAY
                );

            }

        }


        // =================================================
        // SORT BY VOLUME
        // =================================================

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


    // =================================================
    // DDMMMYYYY
    // Example: 30SEP2026
    // =================================================

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


    // =================================================
    // NORMAL DATE
    // =================================================

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

            // =================================================
            // LOAD COMPLETE MASTER
            // =================================================

            const instruments =
                await loadCompleteInstrumentMaster();


            // =================================================
            // TODAY
            // =================================================

            const today =
                new Date();


            today.setHours(
                0,
                0,
                0,
                0
            );


            // =================================================
            // DEBUG
            // =================================================

            const nfoInstruments =
                instruments.filter(
                    item =>
                        String(
                            item.exch_seg ||
                            ""
                        ).toUpperCase() ===
                        "NFO"
                );


            const futStkInstruments =
                nfoInstruments.filter(
                    item =>
                        String(
                            item.instrumenttype ||
                            ""
                        ).toUpperCase() ===
                        "FUTSTK"
                );


            console.log(
                "=========================================="
            );

            console.log(
                "F&O MASTER DEBUG"
            );

            console.log(
                "TOTAL MASTER:",
                instruments.length
            );

            console.log(
                "TOTAL NFO:",
                nfoInstruments.length
            );

            console.log(
                "TOTAL NFO FUTSTK:",
                futStkInstruments.length
            );

            console.log(
                "SAMPLE NFO FUTSTK:",
                futStkInstruments
                    .slice(0, 5)
                    .map(item => ({

                        symbol:
                            item.symbol,

                        name:
                            item.name,

                        token:
                            item.token,

                        expiry:
                            item.expiry,

                        instrumenttype:
                            item.instrumenttype,

                        exch_seg:
                            item.exch_seg,

                        lotsize:
                            item.lotsize

                    }))
            );

            console.log(
                "=========================================="
            );


            // =================================================
            // FILTER VALID FUTURES
            // =================================================

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


            // =================================================
            // FIND NEAREST EXPIRY
            // =================================================

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


            // =================================================
            // ONLY NEAREST EXPIRY
            // =================================================

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


            // =================================================
            // INSTRUMENT MAP
            // =================================================

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


            // =================================================
            // FETCH NFO QUOTES
            // =================================================

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


                console.log(

                    `TRADE FLOW: F&O scanning ${i + 1}-${Math.min(
                        i + BATCH_SIZE,
                        nearestExpiryFutures.length
                    )}/${nearestExpiryFutures.length}`

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


                // =================================================
                // RATE LIMIT
                // =================================================

                if (
                    i + BATCH_SIZE <
                    nearestExpiryFutures.length
                ) {

                    await delay(
                        BATCH_DELAY
                    );

                }

            }


            // =================================================
            // SORT BY VOLUME
            // =================================================

            results.sort(
                (a, b) => {

                    const volumeDifference =
                        safeNumber(
                            b.volume,
                            0
                        ) -
                        safeNumber(
                            a.volume,
                            0
                        );


                    if (
                        volumeDifference !== 0
                    ) {

                        return volumeDifference;

                    }


                    return (
                        safeNumber(
                            b.openInterest,
                            0
                        ) -
                        safeNumber(
                            a.openInterest,
                            0
                        )
                    );

                }
            );


            // =================================================
            // TOP 50
            // =================================================

            const finalResults =
                results.slice(
                    0,
                    TOP_RANKED_STOCKS
                );


            console.log(
                `TRADE FLOW: Real F&O results = ${finalResults.length}`
            );


            return finalResults;

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
            "TRADE FLOW: Building fresh market scanner..."
        );


        const marketStatus =
            getMarketStatus();


        console.log(
            "TRADE FLOW MARKET STATUS:",
            marketStatus
        );


        // =================================================
        // ALL NSE STOCKS
        // =================================================

        const allStocks =
            await fetchAllStocks(
                marketStatus
            );


        // =================================================
        // ALL ROCKERS
        // =================================================

        const rockers =
            buildMarketRockers(
                allStocks
            );


        // =================================================
        // ALL SHOCKERS
        // =================================================

        const shockers =
            buildMarketShockers(
                allStocks
            );


        // =================================================
        // REAL F&O
        // =================================================

        const fnoStocks =
            await getFNOStocks(
                marketStatus
            );


        // =================================================
        // F&O ROCKERS
        // =================================================

        const fnoRockers =
            buildMarketRockers(
                fnoStocks
            );


        // =================================================
        // F&O SHOCKERS
        // =================================================

        const fnoShockers =
            buildMarketShockers(
                fnoStocks
            );


        // =================================================
        // CACHE
        // =================================================

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


        // =================================================
        // LOGS
        // =================================================

        console.log(
            `TRADE FLOW: Fresh scan completed - ${allStocks.length} stocks`
        );


        console.log(
            `TRADE FLOW: All Stocks Rockers - ${rockers.length}`
        );


        console.log(
            `TRADE FLOW: All Stocks Shockers - ${shockers.length}`
        );


        console.log(
            `TRADE FLOW: F&O stocks - ${fnoStocks.length}`
        );


        console.log(
            `TRADE FLOW: F&O Rockers - ${fnoRockers.length}`
        );


        console.log(
            `TRADE FLOW: F&O Shockers - ${fnoShockers.length}`
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


        // =================================================
        // CACHE VALID
        // =================================================

        const cacheValid =
            tradeFlowCache.allStocks.length > 0 &&
            tradeFlowCache.expiresAt > now;


        // =================================================
        // RETURN CACHE
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
        // WAIT FOR REFRESH
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


        // X Factor history clear

        volumeSnapshots.clear();


        // Complete master cache clear

        fullInstrumentMasterCache = null;

        fullInstrumentMasterExpiresAt = 0;


        console.log(
            "TRADE FLOW: Cache + volume snapshots + full master cache cleared"
        );

    };


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getTradeFlow,

    clearTradeFlowCache

};