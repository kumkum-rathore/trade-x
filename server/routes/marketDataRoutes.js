const express =
    require("express");

const router =
    express.Router();
const {

    getMarketIndices,

    getMarketStocks,

    getMarketStock,

    getMarketSectors,

    getMarketPCR,

    getMarketHistory

} = require(
    "../controllers/marketDataController"
);


// INDICES

router.get(
    "/indices",
    getMarketIndices
);


// STOCK
router.get(
    "/stocks",
    getMarketStocks
);

router.get(
    "/stocks/:symbol",
    getMarketStock
);


// SECTORS

router.get(
    "/sectors",
    getMarketSectors
);

// PCR

router.get(
    "/pcr",
    getMarketPCR
);

// MARKET HISTORY

router.get(
    "/history/:symbol",
    getMarketHistory
);
module.exports = router;