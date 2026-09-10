const mongoose = require("mongoose");

const portfolioSchema =
    new mongoose.Schema(
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            symbol: {
                type: String,
                required: true,
                uppercase: true,
                trim: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 0
            },

            averagePrice: {
                type: Number,
                required: true,
                min: 0
            }
        },

        {
            timestamps: true
        }
    );


portfolioSchema.index(
    {
        user: 1,
        symbol: 1
    },
    {
        unique: true
    }
);


module.exports =
    mongoose.model(
        "Portfolio",
        portfolioSchema
    );