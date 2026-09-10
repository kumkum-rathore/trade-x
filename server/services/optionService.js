const getOptionChain = async (symbol = "NIFTY") => {
    const error = new Error(`Live ${symbol} option chain is not configured in this build.`);
    error.code = "OPTION_CHAIN_NOT_CONFIGURED";
    throw error;
};

module.exports = { getOptionChain };
