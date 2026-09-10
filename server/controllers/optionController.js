const {
    getOptionChain
} = require(
    "../services/optionService"
);


const getOptions = async (
    req,
    res
) => {

    try {

        const symbol =
            req.query.symbol ||
            "NIFTY";


        const allowedSymbols = [
            "NIFTY",
            "SENSEX"
        ];


        if (
            !allowedSymbols.includes(
                symbol.toUpperCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Unsupported index"

            });

        }


        const data =
            await getOptionChain(
                symbol.toUpperCase()
            );


        res.status(200).json({

            success: true,

            data

        });


    } catch (error) {

        console.log(error);

        const status = error.code === "OPTION_CHAIN_NOT_CONFIGURED" ? 503 : 500;

        res.status(status).json({

            success: false,

            message:
                "Failed to fetch option chain"

        });

    }

};


module.exports = {
    getOptions
};