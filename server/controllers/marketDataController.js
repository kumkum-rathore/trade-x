const {
    getIndices,
    getStocks,
    getStock,
    getSectors,
    getPCR,
    getHistory
} = require(
    "../services/marketDataService"
);


// GET INDICES

const getMarketIndices = async (
    req,
    res
) => {

    try {

        const data =
            await getIndices();


        res.status(200).json({

            success: true,

            data

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch market indices"

        });

    }

};

// GET ALL STOCKS

const getMarketStocks = async (
    req,
    res
) => {

    try {

        const data =
            await getStocks();


        res.status(200).json({

            success: true,

            data

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch stocks"

        });

    }

};


// GET STOCK

const getMarketStock = async (
    req,
    res
) => {

    try {

        const {
            symbol
        } = req.params;


        const data =
            await getStock(symbol);


        res.status(200).json({

            success: true,

            data

        });

    }

    catch (error) {

        console.log(error);

        res.status(404).json({

            success: false,

            message:
                error.message

        });

    }

};


// GET SECTORS

const getMarketSectors = async (
    req,
    res
) => {

    try {

        const data =
            await getSectors();


        res.status(200).json({

            success: true,

            data

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch sectors"

        });

    }

};

// GET PCR

const getMarketPCR = async (
    req,
    res
) => {

    try {

        const data =
            await getPCR();


        res.status(200).json({

            success: true,

            data

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch PCR"

        });

    }

};
// GET MARKET HISTORY

const getMarketHistory = async (
    req,
    res
) => {

    try {

        const { symbol } =
            req.params;

        const { timeframe } =
            req.query;


        const data =
            await getHistory(
                symbol,
                timeframe
            );


        res.status(200).json({

            success: true,

            data

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch market history"

        });

    }

};


module.exports = {

    getMarketIndices,

    getMarketStocks,

    getMarketStock,

    getMarketSectors,

    getMarketPCR,

    getMarketHistory

};