const {
    getOptionClock
} = require(
    "../services/optionClockService"
);


const getClock = async (
    req,
    res
) => {

    try {

        const data =
            await getOptionClock();


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
                "Failed to fetch option clock"

        });

    }

};


module.exports = {
    getClock
};