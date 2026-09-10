import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function TradeBrahmand() {

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchBrahmand = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    "/trade-brahmand"
                );


            setData(
                response.data.data
            );

            setError("");

        }

        catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load Trade Brahmand"
            );

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchBrahmand();

    }, []);


    if (loading) {

        return (

            <MainLayout>

                <div className="trade-brahmand-page">

                    Loading Trade Brahmand...

                </div>

            </MainLayout>

        );

    }


    if (error) {

        return (

            <MainLayout>

                <div className="trade-brahmand-page">

                    <div className="brahmand-error">

                        {error}

                    </div>

                </div>

            </MainLayout>

        );

    }


    return (

        <MainLayout>

            <div className="trade-brahmand-page">

                <div className="page-header">

                    <h1>
                        Trade Brahmand
                    </h1>

                    <p>
                        Market strength across sectors
                    </p>

                </div>


                {/* SUMMARY */}

                <div className="brahmand-summary">

                    <div className="brahmand-card">

                        <span>
                            Market Bias
                        </span>

                        <strong
                            className={
                                data.marketBias === "Bullish"
                                    ? "brahmand-positive"
                                    : data.marketBias === "Bearish"
                                        ? "brahmand-negative"
                                        : "brahmand-neutral"
                            }
                        >

                            {data.marketBias}

                        </strong>

                    </div>


                    <div className="brahmand-card">

                        <span>
                            Market Score
                        </span>

                        <strong>
                            {data.marketScore}
                            /100
                        </strong>

                    </div>


                    <div className="brahmand-card">

                        <span>
                            Strongest Sector
                        </span>

                        <strong className="brahmand-positive">

                            {data.strongestSector.name}

                        </strong>

                        <small className="brahmand-positive">

                            +
                            {data.strongestSector.changePercent}%

                        </small>

                    </div>


                    <div className="brahmand-card">

                        <span>
                            Weakest Sector
                        </span>

                        <strong className="brahmand-negative">

                            {data.weakestSector.name}

                        </strong>

                        <small className="brahmand-negative">

                            {data.weakestSector.changePercent}%

                        </small>

                    </div>

                </div>


                {/* SECTOR UNIVERSE */}

                <div className="brahmand-universe">

                    <div className="brahmand-title">

                        <h2>
                            Sector Universe
                        </h2>

                        <span>
                            Market strength
                        </span>

                    </div>


                    <div className="sector-universe">

                        {data.sectors.map(
                            (sector) => {

                                const isPositive =
                                    sector.changePercent >= 0;


                                return (

                                    <div
                                        className="universe-row"
                                        key={sector.name}
                                    >

                                        <div className="universe-name">

                                            <strong>
                                                {sector.name}
                                            </strong>

                                            <small>
                                                {sector.index}
                                            </small>

                                        </div>


                                        <div className="universe-bar-area">

                                            <div className="universe-bar">

                                                <div
                                                    className={
                                                        isPositive
                                                            ? "universe-positive-bar"
                                                            : "universe-negative-bar"
                                                    }
                                                    style={{
                                                        width:
                                                            `${sector.score}%`
                                                    }}
                                                />

                                            </div>

                                        </div>


                                        <div className="universe-score">

                                            <strong>
                                                {sector.score}
                                            </strong>

                                        </div>


                                        <div
                                            className={
                                                isPositive
                                                    ? "universe-positive"
                                                    : "universe-negative"
                                            }
                                        >

                                            {isPositive
                                                ? "+"
                                                : ""}

                                            {sector.changePercent}%

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>

            </div>

        </MainLayout>

    );

}


export default TradeBrahmand;