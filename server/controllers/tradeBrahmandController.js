const {
    getTradeBrahmand
} = require(
    "../services/tradeBrahmandService"
);


const getBrahmand = async (
    req,
    res
) => {

    try {

        const data =
            await getTradeBrahmand();


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
                "Failed to fetch Trade Brahmand"

        });

    }

};


module.exports = {
    getBrahmand
};