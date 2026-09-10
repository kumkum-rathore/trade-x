const {
    getMarketOverview,
    getStockQuote,
    getHistoricalData
} = require("../services/marketService");


const marketOverview = async (req, res) => {

    try {

        const data =
            await getMarketOverview();

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch market data"
        });
    }
};


const stockQuote = async (req, res) => {

    try {

        const { symbol } = req.params;

        const stock =
            await getStockQuote(symbol);

        if (!stock) {

            return res.status(404).json({
                success: false,
                message: "Stock not found"
            });
        }

        res.status(200).json({
            success: true,
            data: stock
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stock data"
        });
    }
};
const historicalData = async (req, res) => {

    try {

        const { symbol } = req.params;

        const timeframe =
            req.query.timeframe || "1M";

        const allowedTimeframes = [
            "1D",
            "1W",
            "1M",
            "3M",
            "6M",
            "1Y"
        ];

        if (!allowedTimeframes.includes(timeframe)) {

            return res.status(400).json({
                success: false,
                message: "Invalid timeframe"
            });
        }

        const data =
            await getHistoricalData(
                symbol,
                timeframe
            );

        if (!data) {

            return res.status(404).json({
                success: false,
                message: "Historical data not found"
            });
        }

        res.status(200).json({
            success: true,
            timeframe,
            data
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch historical data"
        });
    }
};

module.exports = {
    marketOverview,
    stockQuote,
    historicalData
};