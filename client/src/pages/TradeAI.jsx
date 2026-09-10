import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function TradeAI() {

    const [symbol, setSymbol] =
        useState("RELIANCE");

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchAI = async (
        selectedSymbol
    ) => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    `/trade-ai?symbol=${selectedSymbol}`
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
                "Failed to load Trade AI"
            );

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchAI(symbol);

    }, [symbol]);


    return (

        <MainLayout>

            <div className="trade-ai-page">

                <div className="page-header">

                    <h1>
                        Trade AI
                    </h1>

                    <p>
                        AI-style market analysis
                        for selected stocks
                    </p>

                </div>


                {/* STOCK SELECTOR */}

                <div className="ai-selector">

                    <label>
                        Select Stock
                    </label>

                    <select
                        value={symbol}
                        onChange={(e) =>
                            setSymbol(
                                e.target.value
                            )
                        }
                    >

                        <option value="RELIANCE">
                            RELIANCE
                        </option>

                        <option value="INFY">
                            INFY
                        </option>

                        <option value="TCS">
                            TCS
                        </option>

                        <option value="HDFCBANK">
                            HDFCBANK
                        </option>

                        <option value="ICICIBANK">
                            ICICIBANK
                        </option>

                    </select>

                </div>


                {loading && (

                    <div className="ai-message">

                        Generating analysis...

                    </div>

                )}


                {error && (

                    <div className="ai-message">

                        {error}

                    </div>

                )}


                {!loading &&
                    !error &&
                    data && (

                        <>

                            {/* STOCK HEADER */}

                            <div className="ai-stock-card">

                                <div>

                                    <span>
                                        Stock
                                    </span>

                                    <h2>
                                        {data.stock.symbol}
                                    </h2>

                                    <p>
                                        {data.stock.name}
                                    </p>

                                </div>


                                <div className="ai-price">

                                    <span>
                                        Current Price
                                    </span>

                                    <strong>
                                        ₹
                                        {data.stock.price.toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                    <small
                                        className={
                                            data.stock.changePercent >= 0
                                                ? "ai-positive"
                                                : "ai-negative"
                                        }
                                    >

                                        {data.stock.changePercent >= 0
                                            ? "+"
                                            : ""}

                                        {data.stock.changePercent}%

                                    </small>

                                </div>

                            </div>


                            {/* AI SUMMARY */}

                            <div className="ai-summary-grid">

                                <div className="ai-summary-card">

                                    <span>
                                        Market Trend
                                    </span>

                                    <strong>
                                        {data.analysis.trend}
                                    </strong>

                                </div>


                                <div className="ai-summary-card">

                                    <span>
                                        Signal
                                    </span>

                                    <strong>
                                        {data.analysis.signal}
                                    </strong>

                                </div>


                                <div className="ai-summary-card">

                                    <span>
                                        AI Score
                                    </span>

                                    <strong>
                                        {data.analysis.score}
                                        /100
                                    </strong>

                                </div>

                            </div>


                            {/* FACTORS */}

                            <div className="ai-factors-grid">

                                <div className="ai-factor-card">

                                    <h2>
                                        Bullish Factors
                                    </h2>

                                    {data.analysis
                                        .bullishFactors
                                        .map(
                                            (factor, index) => (

                                                <div
                                                    className="ai-factor"
                                                    key={index}
                                                >

                                                    ✓ {factor}

                                                </div>

                                            )
                                        )}

                                </div>


                                <div className="ai-factor-card">

                                    <h2>
                                        Bearish Factors
                                    </h2>

                                    {data.analysis
                                        .bearishFactors
                                        .map(
                                            (factor, index) => (

                                                <div
                                                    className="ai-factor"
                                                    key={index}
                                                >

                                                    • {factor}

                                                </div>

                                            )
                                        )}

                                </div>

                            </div>


                            {/* SUMMARY */}

                            <div className="ai-analysis-card">

                                <h2>
                                    AI Analysis
                                </h2>

                                <p>
                                    {data.analysis.summary}
                                </p>

                            </div>

                        </>

                    )}

            </div>

        </MainLayout>

    );

}


export default TradeAI;