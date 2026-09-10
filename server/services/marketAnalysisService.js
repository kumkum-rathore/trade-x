const {
    getMarketOverview
} = require("./marketOverviewService");

const {
    getSectorData
} = require("./sectorService");


const getMarketAnalysis = async () => {

    const market =
        await getMarketOverview();

    const sectors =
        await getSectorData();


    const indices =
        market.indices;


    // Positive and negative index count

    const positiveIndices =
        indices.filter(
            (index) =>
                index.changePercent > 0
        ).length;


    const negativeIndices =
        indices.filter(
            (index) =>
                index.changePercent < 0
        ).length;


    // Market strength

    let marketStrength = "Moderate";

    if (
        positiveIndices > negativeIndices &&
        market.marketBias === "Bullish"
    ) {

        marketStrength = "Strong";

    } else if (
        negativeIndices > positiveIndices &&
        market.marketBias === "Bearish"
    ) {

        marketStrength = "Weak";

    }


    // Sector analysis

    const bullishSectors =
        sectors.sectors.filter(
            (sector) =>
                sector.changePercent > 0
        );


    const bearishSectors =
        sectors.sectors.filter(
            (sector) =>
                sector.changePercent < 0
        );


    return {

        sentiment: market.marketBias,

        strength: marketStrength,

        breadth: market.breadth,

        distribution:
            market.distribution,

        indices,

        sectors: {

            total:
                sectors.sectors.length,

            bullish:
                bullishSectors.length,

            bearish:
                bearishSectors.length

        },

        topSector:
            sectors.topGainer,

        weakSector:
            sectors.topLoser

    };

};


module.exports = {
    getMarketAnalysis
};