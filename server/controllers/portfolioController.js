const Portfolio =
    require("../models/Portfolio");


// GET PORTFOLIO

const getPortfolio = async (
    req,
    res
) => {

    try {

        const portfolio =
            await Portfolio.find({
                user: req.user.userId
            }).sort({
                createdAt: -1
            });


        res.status(200).json({

            success: true,

            data: portfolio

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch portfolio"

        });

    }
};



// ADD HOLDING

const addHolding = async (req, res) => {
    try {

        console.log("BODY:", req.body);
        console.log("USER:", req.user);

        const {
            symbol,
            quantity,
            averagePrice
        } = req.body;

        if (!symbol || !quantity || !averagePrice) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existing = await Portfolio.findOne({
            user: req.user.userId,
            symbol: symbol.toUpperCase()
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Stock already exists in portfolio"
            });
        }

        const holding = await Portfolio.create({
            user: req.user.userId,
            symbol: symbol.toUpperCase(),
            quantity,
            averagePrice
        });

        res.status(201).json({
            success: true,
            message: "Holding added successfully",
            data: holding
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to add holding"
        });
    }
};



// DELETE HOLDING

const deleteHolding = async (
    req,
    res
) => {

    try {

        const { symbol } =
            req.params;


        const deleted =
            await Portfolio.findOneAndDelete({

               user: req.user.userId,

                symbol:
                    symbol.toUpperCase()

            });


        if (!deleted) {

            return res.status(404).json({

                success: false,

                message:
                    "Holding not found"

            });

        }


        const portfolio =
            await Portfolio.find({

               user: req.user.userId

            });


        res.status(200).json({

            success: true,

            message:
                "Holding removed",

            data: portfolio

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to remove holding"

        });

    }
};


module.exports = {

    getPortfolio,

    addHolding,

    deleteHolding

};