const express = require("express");

const {
    getBreadth
} = require("../controllers/breadthController");

const router = express.Router();


// =====================================
// NIFTY 50 BREADTH
// =====================================

router.get(
    "/breadth",
    getBreadth
);


module.exports = router;