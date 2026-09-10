const express =
    require("express");

const router =
    express.Router();


const {
    getAIAnalysis
} =
    require(
        "../controllers/tradeAIController"
    );


router.get(
    "/",
    getAIAnalysis
);


module.exports = router;