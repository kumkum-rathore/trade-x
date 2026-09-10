const {
    getNifty50Breadth
} = require("../services/breadthService");


// =====================================
// GET NIFTY 50 BREADTH
// =====================================

const getBreadth = async (req, res) => {

    try {

        console.log(
            "Fetching complete NIFTY 50 breadth..."
        );

        const data =
            await getNifty50Breadth();

        console.log(
            "NIFTY 50 BREADTH RESULT:",
            {
                total: data.total,
                advances: data.advances,
                declines: data.declines,
                unchanged: data.unchanged
            }
        );

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        console.error(
            "BREADTH CONTROLLER ERROR:",
            error.response?.data ||
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch NIFTY 50 breadth",
            error:
                error.response?.data ||
                error.message
        });

    }

};


module.exports = {
    getBreadth
};