const axios = require("axios");

const {
    getAngelLTP
} = require("./angelOneService");

const nifty50Symbols =
    require("./nifty50Symbols");


// =====================================
// ANGEL ONE SCRIP MASTER
// =====================================

const SCRIP_MASTER_URL =
    "https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json";


// =====================================
// CACHE
// =====================================

let instrumentCache = null;

let instrumentCacheTime = 0;

const CACHE_DURATION =
    24 * 60 * 60 * 1000;


// =====================================
// LOAD INSTRUMENT MASTER
// =====================================

const loadInstrumentMaster =
    async () => {

        const now = Date.now();


        if (
            instrumentCache &&
            now - instrumentCacheTime <
            CACHE_DURATION
        ) {

            return instrumentCache;

        }


        console.log(
            "Downloading Angel One Scrip Master..."
        );


        const response =
            await axios.get(
                SCRIP_MASTER_URL,
                {
                    timeout: 60000
                }
            );


        if (
            !Array.isArray(
                response.data
            )
        ) {

            throw new Error(
                "Invalid Angel One Scrip Master response"
            );

        }


        /*
         * Angel One instrument master
         *
         * NSE cash segment can appear
         * as NSE / nse_cm depending on
         * current master format.
         */

    //     const nseStocks =
    //         response.data.filter(
    //             (item) => {

    //                 const exchange =
    //                     String(
    //                         item.exch_seg || ""
    //                     ).toUpperCase();


    //                 return (

    //                     (
    //                         exchange === "NSE" ||
    //                         exchange === "NSE_CM"
    //                     ) &&

    //                     item.symbol &&

    //                     item.token

    //                 );

    //             }
    //         );


    //     instrumentCache =
    //         nseStocks;

    //     instrumentCacheTime =
    //         now;


    //     console.log(
    //         `Angel Scrip Master loaded: ${nseStocks.length} NSE instruments`
    //     );


    //     return instrumentCache;

    // };


    // =====================================
// FILTER REQUIRED SEGMENTS
// =====================================

const instruments =
    response.data.filter((item) => {

        const exchange =
            String(
                item.exch_seg || ""
            )
                .trim()
                .toUpperCase();

        return (
            (
                exchange === "NSE" ||
                exchange === "NSE_CM" ||
                exchange === "NFO"
            ) &&
            item.symbol &&
            item.token
        );

    });


// =====================================
// DEBUG MASTER
// =====================================

const nseCount =
    instruments.filter((item) => {

        const exchange =
            String(item.exch_seg || "")
                .trim()
                .toUpperCase();

        return (
            exchange === "NSE" ||
            exchange === "NSE_CM"
        );

    }).length;


const nfoCount =
    instruments.filter((item) => {

        const exchange =
            String(item.exch_seg || "")
                .trim()
                .toUpperCase();

        return exchange === "NFO";

    }).length;


const futstkCount =
    instruments.filter((item) => {

        const exchange =
            String(item.exch_seg || "")
                .trim()
                .toUpperCase();

        const instrumentType =
            String(item.instrumenttype || "")
                .trim()
                .toUpperCase();

        return (
            exchange === "NFO" &&
            instrumentType === "FUTSTK"
        );

    }).length;


console.log(
    "====================================="
);

console.log(
    "ANGEL ONE MASTER DEBUG"
);

console.log(
    "TOTAL REQUIRED INSTRUMENTS:",
    instruments.length
);

console.log(
    "NSE:",
    nseCount
);

console.log(
    "NFO:",
    nfoCount
);

console.log(
    "NFO FUTSTK:",
    futstkCount
);

console.log(
    "SAMPLE NFO FUTSTK:",
    instruments
        .filter((item) => {

            const exchange =
                String(item.exch_seg || "")
                    .trim()
                    .toUpperCase();

            const instrumentType =
                String(item.instrumenttype || "")
                    .trim()
                    .toUpperCase();

            return (
                exchange === "NFO" &&
                instrumentType === "FUTSTK"
            );

        })
        .slice(0, 5)
);

console.log(
    "=====================================");


// =====================================
// CACHE
// =====================================

instrumentCache =
    instruments;

instrumentCacheTime =
    now;


console.log(
    `Angel Scrip Master loaded: ${instruments.length} instruments`
);


return instrumentCache;
};

// =====================================
// GET INSTRUMENT TOKEN
// =====================================

// =====================================
// GET INSTRUMENT TOKEN
// =====================================

const getInstrumentToken = async (symbol) => {

    const instruments = await loadInstrumentMaster();

    const cleanSymbol =
        String(symbol)
            .trim()
            .toUpperCase();

    const targetSymbol =
        `${cleanSymbol}-EQ`;

    // =====================================
    // 1. Exact match
    // =====================================

    let instrument =
        instruments.find(
            (item) =>
                String(item.symbol || "")
                    .trim()
                    .toUpperCase() === targetSymbol
        );


    // =====================================
    // 2. Special symbol fallback
    // =====================================

    if (!instrument) {

        instrument =
            instruments.find(
                (item) => {

                    const itemSymbol =
                        String(item.symbol || "")
                            .trim()
                            .toUpperCase();

                    const name =
                        String(item.name || "")
                            .trim()
                            .toUpperCase();

                    return (
                        itemSymbol === cleanSymbol ||
                        name === cleanSymbol
                    );
                }
            );
    }



    if (!instrument && cleanSymbol === "TATAMOTORS") {

    console.log("SEARCHING ALL TATA MOTORS INSTRUMENTS...");

    const tataMatches = instruments.filter((item) => {

        const itemSymbol =
            String(item.symbol || "")
                .trim()
                .toUpperCase();

        const name =
            String(item.name || "")
                .trim()
                .toUpperCase();

        return (
            itemSymbol.includes("TATA") ||
            name.includes("TATA")
        );
    });

    console.log(
        "TATA MATCHES:",
        tataMatches.slice(0, 50)
    );
}
    // =====================================
    // 3. TATAMOTORS specific fallback
    // =====================================

   // =====================================
// 3. TATAMOTORS DEBUG SEARCH
// =====================================

if (!instrument && cleanSymbol === "TATAMOTORS") {

    console.log(
        "🔎 SEARCHING TATA MOTORS IN SCRIP MASTER..."
    );

    const tataMatches = instruments.filter((item) => {

        const itemSymbol =
            String(item.symbol || "")
                .trim()
                .toUpperCase();

        const name =
            String(item.name || "")
                .trim()
                .toUpperCase();

        return (
            itemSymbol.includes("TATA") ||
            name.includes("TATA")
        );
    });

    console.log(
        "🔎 TATA MATCHES:",
        JSON.stringify(
            tataMatches.slice(0, 50),
            null,
            2
        )
    );
}
    // =====================================
    // TOKEN NOT FOUND
    // =====================================

    if (!instrument) {

        console.log(
            `❌ Token not found: ${symbol}`
        );

        return null;
    }


    console.log(
        `✅ Token found: ${symbol} -> ${instrument.symbol} -> ${instrument.token}`
    );


    // =====================================
    // RETURN ANGEL CONFIG
    // =====================================

    return {

        exchange: "NSE",

        tradingsymbol:
            instrument.symbol,

        symboltoken:
            String(instrument.token)

    };

};


// =====================================
// GET ALL NIFTY 50 CONFIGS
// =====================================

const getNifty50Configs =
    async () => {

        const configs = [];


        for (
            const symbol
            of nifty50Symbols
        ) {

            const config =
                await getInstrumentToken(
                    symbol
                );


            if (config) {

                configs.push({

                    symbol,

                    ...config

                });

            }

        }


        console.log(
            `NIFTY 50 tokens found: ${configs.length}/${nifty50Symbols.length}`
        );


        return configs;

    };


// =====================================
// FETCH NIFTY 50 STOCKS
// =====================================

const getNifty50Stocks =
    async () => {

        const configs =
            await getNifty50Configs();


        const results = [];


        /*
         * 8 requests at a time.
         * This keeps the requests
         * controlled instead of firing
         * all 50 together.
         */

        const BATCH_SIZE = 8;


        for (
            let i = 0;
            i < configs.length;
            i += BATCH_SIZE
        ) {

            const batch =
                configs.slice(
                    i,
                    i + BATCH_SIZE
                );


            console.log(
                `Fetching NIFTY 50 stocks ${i + 1} - ${Math.min(
                    i + BATCH_SIZE,
                    configs.length
                )}`
            );


            const batchResults =
                await Promise.all(

                    batch.map(
                        async (stock) => {

                            try {

                                const response =
                                    await getAngelLTP(
                                        {
                                            exchange:
                                                stock.exchange,

                                            tradingsymbol:
                                                stock.tradingsymbol,

                                            symboltoken:
                                                stock.symboltoken
                                        }
                                    );


                                const data =
                                    response?.data;


                                if (!data) {

                                    console.log(
                                        `No data: ${stock.symbol}`
                                    );

                                    return null;

                                }


                                const price =
                                    Number(
                                        data.ltp
                                    );


                                const close =
                                    Number(
                                        data.close
                                    );


                                if (
                                    !Number.isFinite(
                                        price
                                    ) ||
                                    !Number.isFinite(
                                        close
                                    )
                                ) {

                                    console.log(
                                        `Invalid data: ${stock.symbol}`
                                    );

                                    return null;

                                }


                                const change =
                                    price - close;


                                const changePercent =
                                    close !== 0
                                        ? (
                                            change /
                                            close
                                        ) * 100
                                        : 0;


                                return {

                                    symbol:
                                        stock.symbol,

                                    name:
                                        stock.symbol,

                                    tradingSymbol:
                                        stock.tradingsymbol,

                                    token:
                                        stock.symboltoken,

                                    price:
                                        Number(
                                            price.toFixed(2)
                                        ),

                                    value:
                                        Number(
                                            price.toFixed(2)
                                        ),

                                    close:
                                        Number(
                                            close.toFixed(2)
                                        ),

                                    change:
                                        Number(
                                            change.toFixed(2)
                                        ),

                                    changePercent:
                                        Number(
                                            changePercent.toFixed(2)
                                        )

                                };

                            }

                            catch (error) {

                                console.log(
                                    `NIFTY 50 ERROR ${stock.symbol}:`,
                                    error.response?.data ||
                                    error.message
                                );


                                return null;

                            }

                        }
                    )

                );


            results.push(
                ...batchResults.filter(
                    Boolean
                )
            );


            if (
                i + BATCH_SIZE <
                configs.length
            ) {

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            1000
                        )
                );

            }

        }


        console.log(
            "====================================="
        );

        console.log(
            "NIFTY 50 STOCKS RECEIVED:",
            results.length
        );

        console.log(
            "====================================="
        );


        return results;

    };


// =====================================
// CALCULATE BREADTH
// =====================================

const delay = (ms) =>
    new Promise(resolve =>
        setTimeout(resolve, ms)
    );


// =====================================
// NIFTY 50 BREADTH
// =====================================

const getNifty50Breadth = async () => {

    const results = [];

    const failedStocks = [];

    const invalidStocks = [];

    console.log(
        "===================================="
    );

    console.log(
        "FETCHING NIFTY 50 BREADTH"
    );

    console.log(
        "TOTAL SYMBOLS:",
        nifty50Symbols.length
    );

    console.log(
        "===================================="
    );


    for (
        let i = 0;
        i < nifty50Symbols.length;
        i++
    ) {

        const symbol =
            nifty50Symbols[i];


        console.log(
            `[${i + 1}/${nifty50Symbols.length}] Fetching ${symbol}`
        );


        try {

            // =====================================
            // GET INSTRUMENT TOKEN
            // =====================================

            const stockConfig =
                await getInstrumentToken(symbol);


            if (!stockConfig) {

                console.log(
                    `❌ TOKEN NOT FOUND: ${symbol}`
                );

                failedStocks.push({
                    symbol,
                    reason: "TOKEN_NOT_FOUND"
                });

                continue;
            }


            console.log(
                `TOKEN FOUND: ${symbol} -> ${stockConfig.symboltoken}`
            );


            // =====================================
            // GET LTP
            // =====================================

            const response =
                await getAngelLTP(
                    stockConfig
                );


            const data =
                response?.data;


            if (!data) {

                console.log(
                    `❌ NO LTP DATA: ${symbol}`
                );

                failedStocks.push({
                    symbol,
                    reason: "NO_LTP_DATA"
                });

                continue;
            }


            console.log(
                `LTP RESPONSE ${symbol}:`,
                {
                    ltp: data.ltp,
                    close: data.close
                }
            );


            // =====================================
            // PRICE / CLOSE
            // =====================================

            const price =
                Number(data.ltp);

            const close =
                Number(data.close);


            if (
                !Number.isFinite(price) ||
                !Number.isFinite(close)
            ) {

                console.log(
                    `❌ INVALID PRICE DATA: ${symbol}`,
                    {
                        price: data.ltp,
                        close: data.close
                    }
                );


                invalidStocks.push({
                    symbol,
                    reason: "INVALID_PRICE_DATA",
                    ltp: data.ltp,
                    close: data.close
                });


                continue;
            }


            // =====================================
            // CHANGE
            // =====================================

            const change =
                price - close;


            results.push({

                symbol,

                price,

                close,

                change

            });


            console.log(
                `✅ ${symbol} | LTP: ${price} | CLOSE: ${close} | CHANGE: ${change}`
            );


        } catch (error) {

            console.log(
                `❌ BREADTH ERROR: ${symbol}`
            );


            console.log(
                error.response?.data ||
                error.message
            );


            failedStocks.push({

                symbol,

                reason:
                    error.response?.data ||
                    error.message

            });

        }


        // Angel One API ko overload na karne ke liye
        await delay(250);

    }


    // =====================================
    // CALCULATE BREADTH
    // =====================================

    const advances =
        results.filter(
            stock =>
                stock.change > 0
        ).length;


    const declines =
        results.filter(
            stock =>
                stock.change < 0
        ).length;


    const unchanged =
        results.filter(
            stock =>
                stock.change === 0
        ).length;


    // =====================================
    // FINAL DEBUG
    // =====================================

    console.log(
        "===================================="
    );

    console.log(
        "NIFTY 50 BREADTH RESULT"
    );

    console.log(
        "===================================="
    );

    console.log(
        "EXPECTED:",
        nifty50Symbols.length
    );

    console.log(
        "RECEIVED:",
        results.length
    );

    console.log(
        "ADVANCES:",
        advances
    );

    console.log(
        "DECLINES:",
        declines
    );

    console.log(
        "UNCHANGED:",
        unchanged
    );

    console.log(
        "TOTAL:",
        advances +
        declines +
        unchanged
    );


    console.log(
        "FAILED STOCKS:",
        failedStocks
    );


    console.log(
        "INVALID STOCKS:",
        invalidStocks
    );


    console.log(
        "===================================="
    );


    return {

        index: "NIFTY 50",

        total:
            results.length,

        expectedTotal:
            nifty50Symbols.length,

        advances,

        declines,

        unchanged,

        stocks:
            results,

        failedStocks,

        invalidStocks

    };

};




// =====================================
// EXPORT
// =====================================

module.exports = {

    loadInstrumentMaster,

    getInstrumentToken,

    getNifty50Configs,

    getNifty50Stocks,

    getNifty50Breadth

};