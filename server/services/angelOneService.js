const axios = require("axios");
const { generate } = require("otplib");

const ANGEL_HISTORICAL_URL =
    "https://apiconnect.angelone.in/rest/secure/angelbroking/historical/v1/getCandleData";

const ANGEL_LOGIN_URL =
    "https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword";

const ANGEL_LTP_URL =
    "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getLtpData";

const ANGEL_PCR_URL =
    "https://apiconnect.angelone.in/rest/secure/angelbroking/marketData/v1/putCallRatio";


// =====================================================
// JWT TOKEN
// =====================================================

let jwtToken = null;


// =====================================================
// COMMON HEADERS
// =====================================================

const commonHeaders = () => ({

    "Content-Type": "application/json",

    "Accept": "application/json",

    "X-UserType": "USER",

    "X-SourceID": "WEB",

    "X-ClientLocalIP":
        process.env.ANGEL_LOCAL_IP,

    "X-ClientPublicIP":
        process.env.ANGEL_PUBLIC_IP,

    "X-MACAddress":
        process.env.ANGEL_MAC_ADDRESS,

    "X-PrivateKey":
        process.env.ANGEL_API_KEY

});


// =====================================================
// AUTH HEADERS
// =====================================================

const authHeaders = () => ({

    ...commonHeaders(),

    Authorization:
        `Bearer ${jwtToken}`

});


// =====================================================
// ANGEL ONE LOGIN
// =====================================================

const angelLogin = async () => {

    try {

        const otp =
            await generate({

                secret:
                    process.env.ANGEL_TOTP_SECRET

            });


        console.log(
            "TOTP generated successfully"
        );


        const response =
            await axios.post(

                ANGEL_LOGIN_URL,

                {

                    clientcode:
                        process.env.ANGEL_CLIENT_ID,

                    password:
                        process.env.ANGEL_PIN,

                    totp: otp

                },

                {

                    headers:
                        commonHeaders()

                }

            );


        console.log(
            "ANGEL ONE LOGIN:",
            response.data.status
        );


        if (
            response.data.status &&
            response.data.data?.jwtToken
        ) {

            jwtToken =
                response.data.data.jwtToken;


            console.log(
                "Angel One JWT token saved"
            );

        }


        return response.data;

    }

    catch (error) {

        console.log(
            "ANGEL ONE LOGIN ERROR:",

            error.response?.data ||
            error.message
        );

        throw error;

    }

};


// =====================================================
// ANGEL ONE FULL MARKET QUOTE
// =====================================================

const ANGEL_FULL_QUOTE_URL =
    "https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/";


const getAngelFullQuotes = async (exchangeTokens) => {

    try {

        if (!jwtToken) {

            console.log(
                "FULL QUOTE: JWT not found. Logging in..."
            );

            await angelLogin();

        }


        const response =
            await axios.post(

                ANGEL_FULL_QUOTE_URL,

                {
                    mode: "FULL",
                    exchangeTokens
                },

                {
                    headers: authHeaders()
                }

            );


        return response.data;

    }

    catch (error) {

        console.log(
            "ANGEL FULL QUOTE ERROR:",
            error.response?.data ||
            error.message
        );


        if (
            error.response?.status === 401 ||
            error.response?.status === 403 ||
            error.response?.data?.errorcode === "AB1010"
        ) {

            console.log(
                "FULL QUOTE: JWT expired. Re-login..."
            );


            await angelLogin();


            const retryResponse =
                await axios.post(

                    ANGEL_FULL_QUOTE_URL,

                    {
                        mode: "FULL",
                        exchangeTokens
                    },

                    {
                        headers: authHeaders()
                    }

                );


            return retryResponse.data;

        }


        throw error;

    }

};

// =====================================================
// GET LTP
// =====================================================

const getAngelLTP = async ({

    exchange,
    tradingsymbol,
    symboltoken

}) => {

    try {

        if (!jwtToken) {

            console.log(
                "JWT token not found. Logging in..."
            );

            await angelLogin();

        }


        const response =
            await axios.post(

                ANGEL_LTP_URL,

                {

                    exchange,

                    tradingsymbol,

                    symboltoken

                },

                {

                    headers:
                        authHeaders()

                }

            );


        return response.data;

    }

    catch (error) {

        console.log(
            "ANGEL LTP ERROR:",

            error.response?.data ||
            error.message
        );


        // JWT expired / invalid
        if (
            error.response?.status === 401 ||
            error.response?.data?.errorcode === "AB1010"
        ) {

            console.log(
                "JWT expired. Logging in again..."
            );


            await angelLogin();


            const response =
                await axios.post(

                    ANGEL_LTP_URL,

                    {

                        exchange,

                        tradingsymbol,

                        symboltoken

                    },

                    {

                        headers:
                            authHeaders()

                    }

                );


            return response.data;

        }


        throw error;

    }

};


// =====================================================
// GET HISTORICAL DATA
// =====================================================

const getAngelHistoricalData = async ({

    exchange,

    symboltoken,

    interval = "ONE_DAY",

    fromdate,

    todate

}) => {

    try {

        if (!jwtToken) {

            await angelLogin();

        }


        const response =
            await axios.post(

                ANGEL_HISTORICAL_URL,

                {

                    exchange,

                    symboltoken,

                    interval,

                    fromdate,

                    todate

                },

                {

                    headers:
                        authHeaders()

                }

            );


        return response.data;

    }

    catch (error) {

        console.log(
            "ANGEL HISTORICAL ERROR:",

            error.response?.data ||
            error.message
        );


        if (
            error.response?.status === 401 ||
            error.response?.data?.errorcode === "AB1010"
        ) {

            console.log(
                "JWT expired. Logging in again..."
            );


            await angelLogin();


            const response =
                await axios.post(

                    ANGEL_HISTORICAL_URL,

                    {

                        exchange,

                        symboltoken,

                        interval,

                        fromdate,

                        todate

                    },

                    {

                        headers:
                            authHeaders()

                    }

                );


            return response.data;

        }


        throw error;

    }

};


// =====================================================
// GET PCR
// =====================================================

const getAngelPCR = async () => {

    try {

        // JWT nahi hai to login
        if (!jwtToken) {

            console.log("PCR: JWT not found. Logging in...");

            await angelLogin();
        }


        console.log("PCR: Fetching Angel One PCR...");


        const response = await axios.get(
            ANGEL_PCR_URL,
            {
                headers: authHeaders()
            }
        );


        console.log(
            "PCR RAW RESPONSE:",
            JSON.stringify(
                response.data,
                null,
                2
            )
        );


        return response.data;


    } catch (error) {

        console.log(
            "ANGEL PCR ERROR:",
            error.response?.data ||
            error.message
        );


        // JWT expired / unauthorized
        if (
            error.response?.status === 401 ||
            error.response?.data?.errorcode === "AB1010"
        ) {

            console.log(
                "PCR: JWT expired. Re-login..."
            );


            await angelLogin();


            const retryResponse =
                await axios.get(
                    ANGEL_PCR_URL,
                    {
                        headers: authHeaders()
                    }
                );


            console.log(
                "PCR RETRY RESPONSE:",
                JSON.stringify(
                    retryResponse.data,
                    null,
                    2
                )
            );


            return retryResponse.data;
        }


        throw error;
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    angelLogin,
      getAngelFullQuotes,


    getAngelPCR,

    getAngelLTP,

    getAngelHistoricalData

};