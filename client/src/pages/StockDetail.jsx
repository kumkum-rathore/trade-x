import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";

import CandlestickChart
    from "../components/dashboard/CandlestickChart";


function StockDetail() {

    const { symbol } =
        useParams();


    const [stock, setStock] =
        useState(null);


    const [marketStock, setMarketStock] =
        useState(null);


    const [history, setHistory] =
        useState([]);


    const [stats, setStats] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    const [timeframe, setTimeframe] =
        useState("1M");


    // =====================================
    // FETCH STOCK DATA
    // =====================================

    const fetchStockData = async () => {

        try {

            setLoading(true);

            setError("");


            const upperSymbol =
                symbol.toUpperCase();


            // =================================
            // STOCK QUOTE
            // =================================

            const quoteResponse =
                await api.get(
                    `/market/quote/${upperSymbol}`
                );


            console.log(
                "REAL STOCK DETAIL:",
                quoteResponse.data
            );


            // =================================
            // CENTRAL MARKET DATA
            // =================================

            const marketDataResponse =
                await api.get(
                    `/market-data/stocks/${upperSymbol}`
                );


            console.log(
                "REAL MARKET STOCK:",
                marketDataResponse.data
            );


            setMarketStock(
                marketDataResponse.data?.data
            );


            // =================================
            // HISTORICAL DATA
            // =================================

            const historyResponse =
                await api.get(
                    `/market/history/${upperSymbol}?timeframe=${timeframe}`
                );


            console.log(
                "REAL STOCK HISTORY:",
                historyResponse.data
            );


            // =================================
            // GET HISTORY ARRAY
            // =================================

            const historyData =
                historyResponse.data?.data || [];


            console.log(
                "STOCK HISTORY:",
                historyData
            );


            // =================================
            // IMPORTANT
            // =================================
            // Backend already returns:
            //
            // {
            //   time,
            //   open,
            //   high,
            //   low,
            //   close,
            //   volume
            // }
            //
            // So directly set it.
            // =================================

            setHistory(
                historyData
            );


            // =================================
            // STOCK STATS
            // =================================

            const statsResponse =
                await api.get(
                    `/stats/${upperSymbol}`
                );


            console.log(
                "REAL STOCK STATS:",
                statsResponse.data
            );


            setStats(
                statsResponse.data?.data
            );


            // =================================
            // STOCK QUOTE SET
            // =================================

            setStock(
                quoteResponse.data?.data
            );


        } catch (error) {

            console.log(
                "STOCK DETAIL ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to load stock"
            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // USE EFFECT
    // =====================================

    useEffect(() => {

        if (!symbol) {
            return;
        }


        fetchStockData();


    }, [
        symbol,
        timeframe
    ]);


    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (

            <MainLayout>

                <div className="stock-detail-page">

                    <div className="stock-detail-loading">

                        Loading stock data...

                    </div>

                </div>

            </MainLayout>

        );

    }


    // =====================================
    // ERROR
    // =====================================

    if (
        error ||
        !stock
    ) {

        return (

            <MainLayout>

                <div className="stock-detail-page">

                    <div className="stock-detail-error">

                        {error ||
                            "Stock not found"}

                    </div>

                </div>

            </MainLayout>

        );

    }


    // =====================================
    // DISPLAY VALUES
    // =====================================

    const displayStock =
        marketStock || stock;


    const price =
        Number(
            displayStock.price || 0
        );


    const change =
        Number(
            displayStock.change || 0
        );


    const changePercent =
        Number(
            displayStock.changePercent || 0
        );


    // =====================================
    // RETURN
    // =====================================

    return (

        <MainLayout>

            <div className="stock-detail-page">


                {/* =================================
                    HEADER
                ================================= */}

                <div className="stock-detail-header">

                    <div>

                        <h1>

                            {displayStock.symbol ||
                                upperSymbol}

                        </h1>


                        <div className="stock-detail-price">

                            ₹
                            {price.toLocaleString(
                                "en-IN"
                            )}

                        </div>

                    </div>


                    <div
                        className={
                            change >= 0
                                ? "market-positive"
                                : "market-negative"
                        }
                    >

                        {change >= 0
                            ? "+"
                            : ""}

                        {change.toLocaleString(
                            "en-IN"
                        )}

                        {" "}

                        (

                        {changePercent >= 0
                            ? "+"
                            : ""}

                        {changePercent}

                        %)

                    </div>

                </div>


                {/* =================================
                    CHART CARD
                ================================= */}

                <div className="stock-chart-card">


                    <div className="stock-chart-header">

                        <h2>
                            Price Chart
                        </h2>


                        {/* TIMEFRAME */}

                        <div className="timeframe-buttons">

                            {[
                                "1D",
                                "1W",
                                "1M",
                                "3M",
                                "6M",
                                "1Y"
                            ].map(
                                (item) => (

                                    <button
                                        key={item}

                                        className={
                                            timeframe === item
                                                ? "timeframe-btn active"
                                                : "timeframe-btn"
                                        }

                                        onClick={() =>
                                            setTimeframe(
                                                item
                                            )
                                        }
                                    >

                                        {item}

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* =================================
                        CANDLESTICK CHART
                    ================================= */}

                    <div
                        className="stock-chart"
                        style={{
                            width: "100%",
                            minHeight: "400px"
                        }}
                    >

                        {history.length > 0 ? (

                            <CandlestickChart
                                data={history}
                            />

                        ) : (

                            <div
                                style={{
                                    padding: "50px",
                                    textAlign: "center",
                                    color: "#999"
                                }}
                            >

                                No historical data available

                            </div>

                        )}

                    </div>


                </div>


                {/* =================================
                    STOCK INFORMATION
                ================================= */}

                {stats && (

                    <div className="stock-info-grid">


                        {/* OPEN */}

                        <div className="stock-info-card">

                            <span>
                                Open
                            </span>

                            <strong>
                                ₹{stats.open}
                            </strong>

                        </div>


                        {/* HIGH */}

                        <div className="stock-info-card">

                            <span>
                                High
                            </span>

                            <strong>
                                ₹{stats.high}
                            </strong>

                        </div>


                        {/* LOW */}

                        <div className="stock-info-card">

                            <span>
                                Low
                            </span>

                            <strong>
                                ₹{stats.low}
                            </strong>

                        </div>


                        {/* PREVIOUS CLOSE */}

                        <div className="stock-info-card">

                            <span>
                                Previous Close
                            </span>

                            <strong>
                                ₹{stats.previousClose}
                            </strong>

                        </div>


                        {/* VOLUME */}

                        <div className="stock-info-card">

                            <span>
                                Volume
                            </span>

                            <strong>

                                {Number(
                                    stats.volume || 0
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>

                        </div>


                        {/* 52 WEEK HIGH */}

                        <div className="stock-info-card">

                            <span>
                                52W High
                            </span>

                            <strong>
                                ₹{stats.week52High}
                            </strong>

                        </div>


                        {/* 52 WEEK LOW */}

                        <div className="stock-info-card">

                            <span>
                                52W Low
                            </span>

                            <strong>
                                ₹{stats.week52Low}
                            </strong>

                        </div>


                        {/* MARKET CAP */}

                        <div className="stock-info-card">

                            <span>
                                Market Cap
                            </span>

                            <strong>
                                {stats.marketCap}
                            </strong>

                        </div>


                    </div>

                )}

            </div>

        </MainLayout>

    );

}


export default StockDetail;