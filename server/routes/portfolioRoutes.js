const express = require("express");

const router =
    express.Router();

const {
    getPortfolio,
    addHolding,
    deleteHolding
} =
    require(
        "../controllers/portfolioController"
    );


const protect =
    require("../middleware/authMiddleware");


router.get(
    "/",
    protect,
    getPortfolio
);


router.post(
    "/",
    protect,
    addHolding
);


router.delete(
    "/:symbol",
    protect,
    deleteHolding
);


module.exports = router;