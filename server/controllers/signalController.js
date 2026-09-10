const {
    getTradingSignals
} = require(
    "../services/signalService"
);


const getSignals = async (
    req,
    res
) => {

    try {

        const signals =
            await getTradingSignals();


        res.status(200).json({

            success: true,

            data: signals

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch trading signals"

        });

    }

};


module.exports = {
    getSignals
};