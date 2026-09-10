const express =
    require("express");

const router =
    express.Router();


const {
    getBrahmand
} =
    require(
        "../controllers/tradeBrahmandController"
    );


router.get(
    "/",
    getBrahmand
);


module.exports = router;