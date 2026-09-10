const getMarketNews = async () => {

    const news = [
        {
            id: 1,
            title: "Indian Stock Market Opens Higher",
            description:
                "Indian benchmark indices opened higher amid positive market sentiment.",
            source: "Market News",
            category: "Market",
            time: "10 min ago"
        },

        {
            id: 2,
            title: "Reliance Shares Gain After Strong Market Activity",
            description:
                "Reliance Industries remained in focus as trading activity increased.",
            source: "Market News",
            category: "Stocks",
            time: "25 min ago"
        },

        {
            id: 3,
            title: "IT Stocks Remain In Focus",
            description:
                "Technology stocks showed increased activity during today's session.",
            source: "Market News",
            category: "Sector",
            time: "40 min ago"
        },

        {
            id: 4,
            title: "NIFTY Continues To Trade Near Key Levels",
            description:
                "NIFTY remained near important technical levels during the trading session.",
            source: "Market News",
            category: "Index",
            time: "1 hour ago"
        }
    ];

    return news;
};


module.exports = {
    getMarketNews
};