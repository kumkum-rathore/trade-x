const express = require("express");

const {
    angelLogin
} = require("../services/angelOneService");

const router = express.Router();

router.get("/login", async (req, res) => {

    try {

        const data = await angelLogin();

        res.json({
            success: true,
            data
        });

    } catch (error) {

        console.log(
            "ANGEL LOGIN ROUTE ERROR:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message:
                error.response?.data?.message ||
                "Angel One login failed"
        });

    }

});

module.exports = router;