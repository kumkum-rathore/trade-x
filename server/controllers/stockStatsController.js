const {
    getStockStats
} = require("../services/stockStatsService");

const stockStats = async (req, res) => {

    try {

        const { symbol } = req.params;

        const stats =
            await getStockStats(symbol);

        if (!stats) {

            return res.status(404).json({
                success: false,
                message: "Stats not found"
            });
        }

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stats"
        });

    }
};

module.exports = {
    stockStats
};