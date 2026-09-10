const {
    getMarketOverview
} = require(
    "../services/marketOverviewService"
);


const getOverview = async (
    req,
    res
) => {

    try {

        const overview =
            await getMarketOverview();


        res.status(200).json({

            success: true,

            data: overview

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch market overview"

        });

    }

};


module.exports = {
    getOverview
};