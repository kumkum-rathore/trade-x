import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function TradingSignals() {

    const [signals, setSignals] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchSignals = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    "/signals"
                );


            setSignals(
                response.data.data
            );

        }

        catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load trading signals"
            );

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchSignals();

    }, []);


    if (loading) {

        return (

            <MainLayout>

                <div className="signals-page">

                    Loading trading signals...

                </div>

            </MainLayout>

        );

    }


    if (error) {

        return (

            <MainLayout>

                <div className="signals-page">

                    <div className="signals-error">

                        {error}

                    </div>

                </div>

            </MainLayout>

        );

    }


    return (

        <MainLayout>

            <div className="signals-page">

                <div className="page-header">

                    <h1>
                        Trading Signals
                    </h1>

                    <p>
                        Market-based signal analysis
                    </p>

                </div>


                <div className="signals-grid">

                    {signals.map((item) => {

                        const signalClass =
                            item.signal === "BUY"
                                ? "signal-buy"
                                : item.signal === "SELL"
                                    ? "signal-sell"
                                    : "signal-hold";


                        const changeClass =
                            item.changePercent >= 0
                                ? "signal-positive"
                                : "signal-negative";


                        return (

                            <div
                                className="signal-card"
                                key={item.symbol}
                            >

                                <div className="signal-card-top">

                                    <div>

                                        <h3>
                                            {item.symbol}
                                        </h3>

                                        <span>
                                            {item.name}
                                        </span>

                                    </div>


                                    <div
                                        className={`signal-badge ${signalClass}`}
                                    >
                                        {item.signal}
                                    </div>

                                </div>


                                <div className="signal-price">

                                    ₹
                                    {item.price.toLocaleString(
                                        "en-IN"
                                    )}

                                </div>


                                <div className="signal-details">

                                    <div>

                                        <span>
                                            Change
                                        </span>

                                        <strong
                                            className={
                                                changeClass
                                            }
                                        >

                                            {item.changePercent >= 0
                                                ? "+"
                                                : ""}

                                            {item.changePercent}%

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Trend
                                        </span>

                                        <strong>
                                            {item.trend}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Strength
                                        </span>

                                        <strong>
                                            {item.strength}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

        </MainLayout>

    );

}


export default TradingSignals;