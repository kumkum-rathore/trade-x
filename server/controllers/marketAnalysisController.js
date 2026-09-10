const {
    getMarketAnalysis
} = require(
    "../services/marketAnalysisService"
);


const getAnalysis = async (
    req,
    res
) => {

    try {

        const analysis =
            await getMarketAnalysis();


        res.status(200).json({

            success: true,

            data: analysis

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch market analysis"

        });

    }

};


module.exports = {
    getAnalysis
};