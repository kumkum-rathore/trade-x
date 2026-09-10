const {
    getIndexMovers
} = require(
    "../services/indexMoverService"
);


const getMovers = async (
    req,
    res
) => {

    try {

        const index =
            req.query.index ||
            "NIFTY 50";


        const data =
            await getIndexMovers(index);


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
                "Failed to fetch index movers"

        });

    }

};


module.exports = {
    getMovers
};