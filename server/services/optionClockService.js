const { getMarketOverview } = require("./marketService");
const { getPCR } = require("./marketDataService");

const getOptionClock = async () => {
    const now = new Date();
    const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hours = indiaTime.getHours();
    const minutes = indiaTime.getMinutes();
    const seconds = indiaTime.getSeconds();
    const currentSeconds = hours * 3600 + minutes * 60 + seconds;
    const marketOpen = 9 * 3600 + 15 * 60;
    const marketClose = 15 * 3600 + 30 * 60;
    let marketStatus = "CLOSED";
    let remainingSeconds = 0;

    if (currentSeconds >= marketOpen && currentSeconds < marketClose) {
        marketStatus = "OPEN";
        remainingSeconds = marketClose - currentSeconds;
    } else if (currentSeconds < marketOpen) {
        marketStatus = "PRE-OPEN";
        remainingSeconds = marketOpen - currentSeconds;
    }

    const overview = await getMarketOverview().catch(() => ({}));
    const nifty = overview.nifty || null;
    const pcrData = await getPCR().catch(() => ({ pcr: null, sentiment: "Unavailable" }));
    const spotPrice = nifty?.price ?? null;
    const atmStrike = Number.isFinite(spotPrice) ? Math.round(spotPrice / 50) * 50 : null;

    return {
        index: "NIFTY 50",
        marketStatus,
        marketTime: indiaTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
        remaining: {
            hours: Math.floor(remainingSeconds / 3600),
            minutes: Math.floor((remainingSeconds % 3600) / 60),
            seconds: remainingSeconds % 60
        },
        spotPrice,
        atmStrike,
        callOI: null,
        putOI: null,
        pcr: pcrData.pcr ?? null,
        marketBias: pcrData.sentiment || "Unavailable"
    };
};

module.exports = { getOptionClock };
