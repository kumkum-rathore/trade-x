const express = require("express");

const router = express.Router();

const {
    getTradeFlowData,
    clearTradeFlow
} = require("../controllers/tradeFlowController");


// GET
router.get("/", getTradeFlowData);


// CLEAR CACHE
router.delete("/cache", clearTradeFlow);


module.exports = router;