const express =
    require("express");

const router =
    express.Router();


const {
    getMovers
} =
    require(
        "../controllers/indexMoverController"
    );


router.get(
    "/",
    getMovers
);


module.exports = router;