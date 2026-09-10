const {
    getTradeFlow,
    clearTradeFlowCache
} = require("../services/tradeFlowService");


// ==========================================
// GET TRADE FLOW
// ==========================================

const getTradeFlowData = async (req, res) => {

    try {

        const type =
            req.query.type === "fno"
                ? "fno"
                : "all";


        const forceRefresh =
            req.query.forceRefresh === "true";


        // ----------------------------------
        // FORCE REFRESH
        // ----------------------------------

        if (forceRefresh) {

            clearTradeFlowCache();

        }


        // ----------------------------------
        // GET DATA
        // ----------------------------------

        const data =
            await getTradeFlow(type);


        return res.status(200).json({

            success: true,

            data

        });

    }

    catch (error) {

        console.error(
            "TRADE FLOW CONTROLLER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load Trade Flow",

            error:
                error.message

        });

    }

};


// ==========================================
// CLEAR CACHE
// ==========================================

const clearTradeFlow = async (req, res) => {

    try {

        clearTradeFlowCache();


        return res.status(200).json({

            success: true,

            message:
                "Trade Flow cache cleared"

        });

    }

    catch (error) {

        console.error(
            "CLEAR TRADE FLOW CACHE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to clear Trade Flow cache",

            error:
                error.message

        });

    }

};


module.exports = {

    getTradeFlowData,

    clearTradeFlow

};