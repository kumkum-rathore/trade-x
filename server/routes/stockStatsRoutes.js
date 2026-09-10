const express = require("express");

const router =
    express.Router();

const {
    stockStats
} = require(
    "../controllers/stockStatsController"
);

router.get(
    "/:symbol",
    stockStats
);

module.exports = router;