const {
    getTradeAI
} = require(
    "../services/tradeAIService"
);


const getAIAnalysis = async (
    req,
    res
) => {

    try {

        const symbol =
            req.query.symbol ||
            "RELIANCE";


        const data =
            await getTradeAI(symbol);


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
                "Failed to generate Trade AI analysis"

        });

    }

};


module.exports = {
    getAIAnalysis
};