const express =
    require("express");

const router =
    express.Router();


const {
    getOptions
} =
    require(
        "../controllers/optionController"
    );


router.get(
    "/",
    getOptions
);


module.exports = router;