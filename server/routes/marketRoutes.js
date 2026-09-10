const express = require("express");
const {
    marketOverview,
    stockQuote,
    historicalData
} = require("../controllers/marketController");

const router = express.Router();


router.get(
    "/overview",
    marketOverview
);


router.get(
    "/quote/:symbol",
    stockQuote
);

router.get(
    "/history/:symbol",
    historicalData
);


module.exports = router;