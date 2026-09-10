



import {
    useEffect,
    useState
} from "react";

import api from "../../services/api";


function MarketOverview() {

    const [markets, setMarkets] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ===============================
    // FETCH REAL MARKET DATA
    // ===============================

const fetchMarketData = async () => {
    try {
        setLoading(true);
        setError("");

        const response = await api.get(
            "/market/overview"
        );

        console.log(
            "REAL MARKET DATA:",
            response.data
        );

        const data = response.data.data || {};

        setMarkets([data.nifty, data.sensex, data.bankNifty].filter(Boolean).map((item) => ({
            ...item,
            value: item.price ?? item.value
        })));

    } catch (error) {
        console.log(
            "MARKET API ERROR:",
            error
        );

        setError(
            error.response?.data?.message ||
            "Failed to load market data"
        );

    } finally {
        setLoading(false);
    }
};

    // ===============================
    // INITIAL LOAD
    // ===============================

    useEffect(() => {

        fetchMarketData();

    }, []);


    // ===============================
    // LOADING
    // ===============================

    if (loading) {

        return (

            <section className="market-overview">

                <div className="section-header">

                    <div>

                        <h2>
                            Market Overview
                        </h2>

                        <p>
                            Current market snapshot
                        </p>

                    </div>

                </div>


                <div className="market-loading">

                    Loading real market data...

                </div>

            </section>

        );

    }


    // ===============================
    // ERROR
    // ===============================

    if (error) {

        return (

            <section className="market-overview">

                <div className="section-header">

                    <div>

                        <h2>
                            Market Overview
                        </h2>

                        <p>
                            Current market snapshot
                        </p>

                    </div>


                    <button
                        onClick={fetchMarketData}
                        className="refresh-market-btn"
                    >
                        Retry
                    </button>

                </div>


                <div className="market-error">

                    {error}

                </div>

            </section>

        );

    }


    // ===============================
    // MARKET CARD
    // ===============================

 const renderMarketCard = (item) => {

    if (!item) {
        return null;
    }

    const value = Number(item.value);
    const change = Number(item.change);
    const changePercent = Number(item.changePercent);

    const isPositive = change >= 0;

    return (
        <div
            className="market-card"
            key={item.symbol}
        >

            <div className="market-card-top">
                <h3>
                    {item.name || item.symbol}
                </h3>
            </div>

            <div className="market-price">
                ₹
                {value.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}
            </div>

            <div
                className={
                    isPositive
                        ? "market-positive"
                        : "market-negative"
                }
            >

                {isPositive ? "+" : ""}
                {change.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}

                {" ("}

                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}

                {"%)"}

            </div>

        </div>
    );
};


    // ===============================
    // UI
    // ===============================

    return (

        <section className="market-overview">


            <div className="section-header">

                <div>

                    <h2>
                        Market Overview
                    </h2>

                    <p>
                        Live market snapshot
                    </p>

                </div>


                <button
                    onClick={fetchMarketData}
                    className="refresh-market-btn"
                >

                    Refresh

                </button>

            </div>


            <div className="market-grid">

                {markets.map(
                    (item) =>
                        renderMarketCard(item)
                )}

            </div>


        </section>

    );

}


export default MarketOverview;