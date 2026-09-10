const express =
    require("express");

const router =
    express.Router();


const {
    getClock
} =
    require(
        "../controllers/optionClockController"
    );


router.get(
    "/",
    getClock
);


module.exports = router;