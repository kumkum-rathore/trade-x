const express =
    require("express");

const router =
    express.Router();


const {
    getOverview
} =
    require(
        "../controllers/marketOverviewController"
    );


router.get(
    "/",
    getOverview
);


module.exports = router;