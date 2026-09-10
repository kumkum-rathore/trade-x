const {
    getMarketNews
} = require("../services/newsService");


const getNews = async (req, res) => {

    try {

        const news =
            await getMarketNews();


        res.status(200).json({

            success: true,

            data: news

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch market news"

        });

    }
};


module.exports = {
    getNews
};