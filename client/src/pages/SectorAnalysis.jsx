import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function SectorAnalysis() {

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [marketSectors, setMarketSectors] =
        useState([]);


    const fetchSectors = async () => {

        try {

            setLoading(true);
            setError("");


            // Existing API
            const response =
                await api.get(
                    "/sectors"
                );


            setData(
                response.data.data
            );


            // Central Market Data API
            const marketResponse =
                await api.get(
                    "/market-data/sectors"
                );


            console.log(
                "CENTRAL SECTOR DATA:",
                marketResponse.data
            );


            setMarketSectors(
                marketResponse.data.data
            );


        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load sector data"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchSectors();

    }, []);


    if (loading) {

        return (

            <MainLayout>

                <div className="sector-page">

                    Loading sector analysis...

                </div>

            </MainLayout>

        );

    }


    if (error) {

        return (

            <MainLayout>

                <div className="sector-page">

                    <div className="sector-error">

                        {error}

                    </div>

                </div>

            </MainLayout>

        );

    }


    // Calculate Top Gainer
    const topGainer =
        [...marketSectors]
            .sort(
                (a, b) =>
                    b.changePercent -
                    a.changePercent
            )[0];


    // Calculate Top Loser
    const topLoser =
        [...marketSectors]
            .sort(
                (a, b) =>
                    a.changePercent -
                    b.changePercent
            )[0];


    return (

        <MainLayout>

            <div className="sector-page">


                {/* PAGE HEADER */}

                <div className="page-header">

                    <h1>
                        Sector Analysis
                    </h1>

                    <p>
                        Track performance across
                        major market sectors
                    </p>

                </div>


                {/* TOP SECTORS */}

                <div className="sector-highlight-grid">


                    {/* TOP GAINER */}

                    <div className="sector-highlight">

                        <span>
                            Top Gainer
                        </span>


                        <h2>
                            {topGainer?.name || "-"}
                        </h2>


                        <strong className="sector-positive">

                            {topGainer
                                ? `+${topGainer.changePercent}%`
                                : "0%"
                            }

                        </strong>

                    </div>



                    {/* TOP LOSER */}

                    <div className="sector-highlight">

                        <span>
                            Top Loser
                        </span>


                        <h2>
                            {topLoser?.name || "-"}
                        </h2>


                        <strong className="sector-negative">

                            {topLoser
                                ? `${topLoser.changePercent}%`
                                : "0%"
                            }

                        </strong>

                    </div>

                </div>



                {/* SECTOR LIST */}

                <div className="sector-card">


                    <div className="sector-card-title">

                        Sector Performance

                    </div>


                    <div className="sector-list">


                        {marketSectors.map(
                            (sector) => {

                                const positive =
                                    sector.changePercent >= 0;


                                return (

                                    <div
                                        className="sector-row"
                                        key={sector.name}
                                    >


                                        {/* NAME */}

                                        <div className="sector-name">

                                            {sector.name}

                                        </div>



                                        {/* BAR */}

                                        <div className="sector-bar">

                                            <div
                                                className={
                                                    positive
                                                        ? "sector-fill-positive"
                                                        : "sector-fill-negative"
                                                }

                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            Math.abs(
                                                                sector.changePercent
                                                            ) * 20,
                                                            100
                                                        )}%`
                                                }}
                                            />

                                        </div>



                                        {/* CHANGE */}

                                        <div
                                            className={
                                                positive
                                                    ? "sector-positive"
                                                    : "sector-negative"
                                            }
                                        >

                                            {positive
                                                ? "+"
                                                : ""}

                                            {sector.changePercent}%

                                        </div>



                                        {/* STATUS */}

                                        <div className="sector-status">

                                            {positive
                                                ? "Bullish"
                                                : "Bearish"}

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


export default SectorAnalysis;