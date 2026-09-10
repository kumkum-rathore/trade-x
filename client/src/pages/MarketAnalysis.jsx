import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function MarketAnalysis() {

    const [analysis, setAnalysis] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchAnalysis = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    "/analysis"
                );


            setAnalysis(
                response.data.data
            );


        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load market analysis"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchAnalysis();

    }, []);


    if (loading) {

        return (

            <MainLayout>

                <div className="analysis-page">

                    Loading market analysis...

                </div>

            </MainLayout>

        );

    }


    if (error) {

        return (

            <MainLayout>

                <div className="analysis-page">

                    <div className="analysis-error">

                        {error}

                    </div>

                </div>

            </MainLayout>

        );

    }


    const sentimentClass =
        analysis.sentiment === "Bullish"
            ? "analysis-positive"
            : analysis.sentiment === "Bearish"
                ? "analysis-negative"
                : "analysis-neutral";


    const strengthClass =
        analysis.strength === "Strong"
            ? "analysis-positive"
            : analysis.strength === "Weak"
                ? "analysis-negative"
                : "analysis-neutral";


    return (

        <MainLayout>

            <div className="analysis-page">

                <div className="page-header">

                    <h1>
                        Market Analysis
                    </h1>

                    <p>
                        Overall market sentiment,
                        strength and performance
                    </p>

                </div>


                {/* SUMMARY */}

                <div className="analysis-summary-grid">

                    <div className="analysis-card">

                        <span>
                            Overall Sentiment
                        </span>

                        <strong
                            className={sentimentClass}
                        >
                            {analysis.sentiment}
                        </strong>

                    </div>


                    <div className="analysis-card">

                        <span>
                            Market Strength
                        </span>

                        <strong
                            className={strengthClass}
                        >
                            {analysis.strength}
                        </strong>

                    </div>


                    <div className="analysis-card">

                        <span>
                            Bullish Sectors
                        </span>

                        <strong className="analysis-positive">

                            {analysis.sectors.bullish}

                        </strong>

                    </div>


                    <div className="analysis-card">

                        <span>
                            Bearish Sectors
                        </span>

                        <strong className="analysis-negative">

                            {analysis.sectors.bearish}

                        </strong>

                    </div>

                </div>


                {/* MARKET BREADTH */}

                <div className="analysis-section">

                    <h2>
                        Market Breadth
                    </h2>


                    <div className="breadth-analysis-grid">

                        <div>

                            <span>
                                Advances
                            </span>

                            <strong className="analysis-positive">

                                {analysis.breadth.advances}

                            </strong>

                        </div>


                        <div>

                            <span>
                                Declines
                            </span>

                            <strong className="analysis-negative">

                                {analysis.breadth.declines}

                            </strong>

                        </div>


                        <div>

                            <span>
                                Unchanged
                            </span>

                            <strong>

                                {analysis.breadth.unchanged}

                            </strong>

                        </div>

                    </div>

                </div>


                {/* INDEX PERFORMANCE */}

                <div className="analysis-section">

                    <h2>
                        Index Performance
                    </h2>


                    <div className="analysis-index-grid">

                        {analysis.indices.map(
                            (index) => {

                                const positive =
                                    index.changePercent >= 0;


                                return (

                                    <div
                                        className="analysis-index-card"
                                        key={index.symbol}
                                    >

                                        <span>
                                            {index.symbol}
                                        </span>

                                        <strong>

                                            {index.price.toLocaleString(
                                                "en-IN"
                                            )}

                                        </strong>

                                        <small
                                            className={
                                                positive
                                                    ? "analysis-positive"
                                                    : "analysis-negative"
                                            }
                                        >

                                            {positive
                                                ? "+"
                                                : ""}

                                            {index.changePercent}%

                                        </small>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>


                {/* SECTOR ANALYSIS */}

                <div className="analysis-section">

                    <h2>
                        Sector Analysis
                    </h2>


                    <div className="analysis-sector-grid">

                        <div>

                            <span>
                                Strongest Sector
                            </span>

                            <strong className="analysis-positive">

                                {analysis.topSector.name}

                            </strong>

                            <small>

                                +
                                {analysis.topSector.changePercent}%

                            </small>

                        </div>


                        <div>

                            <span>
                                Weakest Sector
                            </span>

                            <strong className="analysis-negative">

                                {analysis.weakSector.name}

                            </strong>

                            <small>

                                {analysis.weakSector.changePercent}%

                            </small>

                        </div>

                    </div>

                </div>


                {/* DISTRIBUTION */}

                <div className="analysis-section">

                    <h2>
                        Market Distribution
                    </h2>


                    <div className="analysis-distribution">

                        <div>

                            <span>
                                Bullish
                            </span>

                            <strong>
                                {analysis.distribution.bullish}%
                            </strong>

                        </div>


                        <div className="analysis-distribution-bar">

                            <div
                                className="analysis-bullish-bar"
                                style={{
                                    width:
                                        `${analysis.distribution.bullish}%`
                                }}
                            />

                        </div>


                        <div>

                            <span>
                                Bearish
                            </span>

                            <strong>
                                {analysis.distribution.bearish}%
                            </strong>

                        </div>


                        <div className="analysis-distribution-bar">

                            <div
                                className="analysis-bearish-bar"
                                style={{
                                    width:
                                        `${analysis.distribution.bearish}%`
                                }}
                            />

                        </div>


                        <div>

                            <span>
                                Neutral
                            </span>

                            <strong>
                                {analysis.distribution.neutral}%
                            </strong>

                        </div>


                        <div className="analysis-distribution-bar">

                            <div
                                className="analysis-neutral-bar"
                                style={{
                                    width:
                                        `${analysis.distribution.neutral}%`
                                }}
                            />

                        </div>

                    </div>

                </div>

            </div>

        </MainLayout>

    );

}


export default MarketAnalysis;