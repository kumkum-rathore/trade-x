const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist
} = require("../controllers/watchlistController");

const router = express.Router();

router.get(
    "/",
    protect,
    getWatchlist
);

router.post(
    "/",
    protect,
    addToWatchlist
);

router.delete(
    "/:symbol",
    protect,
    removeFromWatchlist
);

module.exports = router;