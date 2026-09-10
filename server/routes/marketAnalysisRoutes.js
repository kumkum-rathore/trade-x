const express =
    require("express");

const router =
    express.Router();


const {
    getAnalysis
} =
    require(
        "../controllers/marketAnalysisController"
    );


router.get(
    "/",
    getAnalysis
);


module.exports = router;