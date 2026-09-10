import {
    useEffect,
    useState
} from "react";

import api from "../../services/api";


function MarketBias() {

    const [bias, setBias] =
        useState("Neutral");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchMarketBias = async () => {

        try {

            setLoading(true);
            setError("");


            const response =
                await api.get(
                    "/market-data/stocks"
                );


            console.log(
                "CENTRAL MARKET BIAS:",
                response.data
            );


            const stocks =
                response.data.data || [];


            let advancing = 0;
            let declining = 0;


            stocks.forEach((stock) => {

                if (
                    stock.changePercent > 0
                ) {

                    advancing++;

                } else if (
                    stock.changePercent < 0
                ) {

                    declining++;

                }

            });


            if (advancing > declining) {

                setBias("Bullish");

            } else if (
                declining > advancing
            ) {

                setBias("Bearish");

            } else {

                setBias("Neutral");

            }


        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load market bias"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchMarketBias();

    }, []);


    if (loading) {

        return (

            <div className="analysis-card">

                <h3>
                    Market Bias
                </h3>

                <div className="bias-value">

                    Loading...

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="analysis-card">

                <h3>
                    Market Bias
                </h3>

                <div className="bias-value">

                    {error}

                </div>

            </div>

        );

    }


    return (

        <div className="analysis-card">

            <h3>
                Market Bias
            </h3>


            <div
                className={
                    bias === "Bullish"
                        ? "bias-value bullish"
                        : bias === "Bearish"
                            ? "bias-value bearish"
                            : "bias-value neutral"
                }
            >

                {bias}

            </div>


            <p>

                {bias === "Bullish"
                    ? "Overall market sentiment is positive."
                    : bias === "Bearish"
                        ? "Overall market sentiment is negative."
                        : "Overall market sentiment is neutral."
                }

            </p>

        </div>

    );

}


export default MarketBias;