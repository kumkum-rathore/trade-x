const { getSectorData } = require("./sectorService");

const getTradeBrahmand = async () => {
    const { sectors } = await getSectorData();
    const enriched = sectors.map((sector) => ({
        ...sector,
        index: `NIFTY ${sector.name.toUpperCase()}`,
        score: Math.max(0, Math.min(100, Math.round(50 + sector.changePercent * 10)))
    }));
    const sorted = [...enriched].sort((a, b) => b.changePercent - a.changePercent);
    const marketScore = enriched.length
        ? Math.round(enriched.reduce((sum, sector) => sum + sector.score, 0) / enriched.length)
        : 0;

    return {
        marketBias: marketScore >= 65 ? "Bullish" : marketScore <= 40 ? "Bearish" : "Neutral",
        marketScore,
        strongestSector: sorted[0],
        weakestSector: sorted[sorted.length - 1],
        sectors: sorted
    };
};

module.exports = { getTradeBrahmand };
