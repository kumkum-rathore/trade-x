const User = require("../models/User");

const getWatchlist = async (req, res) => {
    try {

        const user = await User.findById(req.user.userId)
            .select("watchlist");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            watchlist: user.watchlist
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};


const addToWatchlist = async (req, res) => {
    try {

        const { symbol } = req.body;

        if (!symbol) {
            return res.status(400).json({
                success: false,
                message: "Stock symbol is required"
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const stockSymbol = symbol.toUpperCase();

        const alreadyExists = user.watchlist.some(
            (stock) => stock.symbol === stockSymbol
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Stock already in watchlist"
            });
        }

        user.watchlist.push({
            symbol: stockSymbol
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Stock added to watchlist",
            watchlist: user.watchlist
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};


const removeFromWatchlist = async (req, res) => {
    try {

        const { symbol } = req.params;

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.watchlist = user.watchlist.filter(
            (stock) => stock.symbol !== symbol.toUpperCase()
        );

        await user.save();

        res.status(200).json({
            success: true,
            message: "Stock removed from watchlist",
            watchlist: user.watchlist
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};


module.exports = {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist
};