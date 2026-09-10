const {
    getSectorData
} = require(
    "../services/sectorService"
);


const getSectors = async (
    req,
    res
) => {

    try {

        const data =
            await getSectorData();


        res.status(200).json({

            success: true,

            data

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch sector data"

        });

    }

};


module.exports = {
    getSectors
};