import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function MarketOverview() {

    // =====================================
    // STATES
    // =====================================

    const [marketIndices, setMarketIndices] =
        useState([]);

    const [stocks, setStocks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================
    // FETCH ALL MARKET DATA
    // =====================================

    const fetchMarketData = async () => {

        try {

            setLoading(true);
            setError("");


            // =====================================
            // FETCH INDICES + STOCKS TOGETHER
            // =====================================

            const [
                indicesResponse,
                stocksResponse
            ] = await Promise.all([

                api.get(
                    "/market-data/indices"
                ),

                api.get(
                    "/market-data/stocks"
                )

            ]);


            console.log(
                "MARKET INDICES:",
                indicesResponse.data
            );

            console.log(
                "MARKET STOCKS:",
                stocksResponse.data
            );


            // =====================================
            // INDICES
            // =====================================

            const indicesData =
                indicesResponse.data?.data || {};


            const indices = [

                indicesData.nifty,

                indicesData.sensex,

                indicesData.bankNifty

            ]
                .filter(Boolean)
                .map((item) => ({

                    ...item,

                    value:
                        item.price ??
                        item.value

                }));


            setMarketIndices(indices);


            // =====================================
            // NIFTY 50 STOCKS
            // =====================================

            const stocksData =
                stocksResponse.data?.data || [];


            const validStocks =
                Array.isArray(stocksData)
                    ? stocksData
                    : [];


            console.log(
                "TOTAL LIVE STOCKS:",
                validStocks.length
            );


            setStocks(validStocks);


        } catch (error) {

            console.log(
                "MARKET DATA ERROR:",
                error
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Failed to load market data"

            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // INITIAL LOAD
    // =====================================

    useEffect(() => {

        fetchMarketData();

    }, []);


    // =====================================
    // MARKET DISTRIBUTION
    // =====================================

    const advances =
        stocks.filter(
            (stock) =>
                Number(stock.changePercent) > 0
        );


    const declines =
        stocks.filter(
            (stock) =>
                Number(stock.changePercent) < 0
        );


    const unchanged =
        stocks.filter(
            (stock) =>
                Number(stock.changePercent) === 0
        );


    const totalStocks =
        stocks.length;


    // =====================================
    // TOP GAINERS
    // ALL AVAILABLE GAINERS
    // =====================================

    const topGainers =
        [...advances].sort(
            (a, b) =>
                Number(b.changePercent) -
                Number(a.changePercent)
        );


    // =====================================
    // TOP LOSERS
    // ALL AVAILABLE LOSERS
    // =====================================

    const topLosers =
        [...declines].sort(
            (a, b) =>
                Number(a.changePercent) -
                Number(b.changePercent)
        );


    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (

            <MainLayout>

                <div className="market-overview-page">

                    <div className="page-header">

                        <h1>
                            Markets
                        </h1>

                        <p>
                            Loading live market data...
                        </p>

                    </div>


                    <div className="market-loading">

                        Fetching live NIFTY 50,
                        SENSEX and BANK NIFTY data...

                    </div>

                </div>

            </MainLayout>

        );

    }


    // =====================================
    // ERROR
    // =====================================

    if (error) {

        return (

            <MainLayout>

                <div className="market-overview-page">

                    <div className="page-header">

                        <h1>
                            Markets
                        </h1>

                        <p>
                            Market data
                        </p>

                    </div>


                    <div className="market-error">

                        <p>
                            {error}
                        </p>


                        <button
                            onClick={fetchMarketData}
                            className="refresh-market-btn"
                        >

                            Retry

                        </button>

                    </div>

                </div>

            </MainLayout>

        );

    }


    // =====================================
    // MARKET CARD
    // =====================================

    const renderIndexCard = (index) => {

        if (!index) {
            return null;
        }


        const value =
            Number(index.value || 0);


        const change =
            Number(index.change || 0);


        const changePercent =
            Number(index.changePercent || 0);


        const positive =
            changePercent >= 0;


        return (

            <div
                className="index-card"
                key={index.symbol}
            >

                <div className="index-name">

                    {index.name ||
                        index.symbol}

                </div>


                <div className="index-price">

                    {value.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}

                </div>


                <div
                    className={
                        positive
                            ? "market-positive"
                            : "market-negative"
                    }
                >

                    {positive ? "+" : ""}

                    {change.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}

                    {" ("}

                    {positive ? "+" : ""}

                    {changePercent.toFixed(2)}

                    {"%)"}

                </div>

            </div>

        );

    };


    // =====================================
    // STOCK ROW
    // =====================================

    const renderStockRow = (
        stock,
        type
    ) => {

        const price =
            Number(stock.price || 0);


        const change =
            Number(stock.change || 0);


        const changePercent =
            Number(
                stock.changePercent || 0
            );


        const positive =
            changePercent >= 0;


        return (

            <div
                className="stock-row"
                key={stock.symbol}
            >

                <div>

                    <strong>
                        {stock.symbol}
                    </strong>


                    <small>

                        ₹
                        {price.toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )}

                    </small>

                </div>


                <div
                    className={
                        positive
                            ? "positive"
                            : "negative"
                    }
                >

                    {positive
                        ? "+"
                        : ""}

                    {changePercent.toFixed(2)}
                    %

                </div>

            </div>

        );

    };


    // =====================================
    // PERCENTAGE HELPER
    // =====================================

    const getPercentage = (
        value
    ) => {

        if (!totalStocks) {
            return 0;
        }


        return (
            (value / totalStocks) *
            100
        ).toFixed(1);

    };


    // =====================================
    // UI
    // =====================================

    return (

        <MainLayout>

            <div className="market-overview-page">


                {/* ================================= */}
                {/* PAGE HEADER */}
                {/* ================================= */}

                <div className="page-header">

                    <div>

                        <h1>
                            Markets
                        </h1>

                        <p>
                            Live market performance
                            and NIFTY 50 market breadth
                        </p>

                    </div>


                    <button
                        onClick={fetchMarketData}
                        className="refresh-market-btn"
                    >

                        Refresh

                    </button>

                </div>



                {/* ================================= */}
                {/* INDEX CARDS */}
                {/* ================================= */}

                <div className="index-grid">

                    {marketIndices.map(
                        (index) =>
                            renderIndexCard(index)
                    )}

                </div>



                {/* ================================= */}
                {/* MARKET DISTRIBUTION */}
                {/* ================================= */}

                <div className="overview-card">

                    <div className="card-title">

                        Market Distribution

                    </div>


                    <div className="distribution-subtitle">

                        NIFTY 50 • Live Stocks

                    </div>


                    {/* TOTAL */}

                    <div className="distribution-total">

                        <strong>
                            {totalStocks}
                        </strong>

                        <span>
                            Stocks Available
                        </span>

                    </div>


                    {/* DISTRIBUTION STATS */}

                    <div className="breadth-grid">


                        {/* ADVANCES */}

                        <div>

                            <strong>
                                {advances.length}
                            </strong>

                            <span>
                                Advances
                            </span>

                            <small>
                                {getPercentage(
                                    advances.length
                                )}
                                %
                            </small>

                        </div>


                        {/* DECLINES */}

                        <div>

                            <strong>
                                {declines.length}
                            </strong>

                            <span>
                                Declines
                            </span>

                            <small>
                                {getPercentage(
                                    declines.length
                                )}
                                %
                            </small>

                        </div>


                        {/* UNCHANGED */}

                        <div>

                            <strong>
                                {unchanged.length}
                            </strong>

                            <span>
                                Unchanged
                            </span>

                            <small>
                                {getPercentage(
                                    unchanged.length
                                )}
                                %
                            </small>

                        </div>

                    </div>


                    {/* ================================= */}
                    {/* BULLISH BAR */}
                    {/* ================================= */}

                    <div className="distribution-item">

                        <div className="distribution-label">

                            <span>
                                Bullish
                            </span>

                            <strong>
                                {getPercentage(
                                    advances.length
                                )}
                                %
                            </strong>

                        </div>


                        <div className="distribution-bar">

                            <div
                                className="distribution-fill bullish-fill"
                                style={{
                                    width:
                                        `${getPercentage(
                                            advances.length
                                        )}%`
                                }}
                            />

                        </div>

                    </div>


                    {/* ================================= */}
                    {/* BEARISH BAR */}
                    {/* ================================= */}

                    <div className="distribution-item">

                        <div className="distribution-label">

                            <span>
                                Bearish
                            </span>

                            <strong>
                                {getPercentage(
                                    declines.length
                                )}
                                %
                            </strong>

                        </div>


                        <div className="distribution-bar">

                            <div
                                className="distribution-fill bearish-fill"
                                style={{
                                    width:
                                        `${getPercentage(
                                            declines.length
                                        )}%`
                                }}
                            />

                        </div>

                    </div>


                    {/* ================================= */}
                    {/* NEUTRAL BAR */}
                    {/* ================================= */}

                    <div className="distribution-item">

                        <div className="distribution-label">

                            <span>
                                Neutral
                            </span>

                            <strong>
                                {getPercentage(
                                    unchanged.length
                                )}
                                %
                            </strong>

                        </div>


                        <div className="distribution-bar">

                            <div
                                className="distribution-fill neutral-fill"
                                style={{
                                    width:
                                        `${getPercentage(
                                            unchanged.length
                                        )}%`
                                }}
                            />

                        </div>

                    </div>


                    {/* VALIDATION */}

                    <div className="distribution-footer">

                        <span>
                            Advances + Declines + Unchanged
                        </span>

                        <strong>

                            {advances.length +
                                declines.length +
                                unchanged.length}

                            {" / "}

                            {totalStocks}

                        </strong>

                    </div>

                </div>



                {/* ================================= */}
                {/* TOP GAINERS + TOP LOSERS */}
                {/* ================================= */}

                <div className="overview-grid">


                    {/* ================================= */}
                    {/* TOP GAINERS */}
                    {/* ================================= */}

                    <div className="overview-card">

                        <div className="card-header">

                            <div>

                                <h3>
                                    Top Gainers
                                </h3>

                                <span>
                                    NIFTY 50
                                </span>

                            </div>

                        </div>


                        <div className="stock-list">

                            {topGainers.length === 0 ? (

                                <div className="stock-list-empty">

                                    No gainers available

                                </div>

                            ) : (

                                topGainers.map(
                                    (stock) =>
                                        renderStockRow(
                                            stock,
                                            "gainer"
                                        )
                                )

                            )}

                        </div>

                    </div>



                    {/* ================================= */}
                    {/* TOP LOSERS */}
                    {/* ================================= */}

                    <div className="overview-card">

                        <div className="card-header">

                            <div>

                                <h3>
                                    Top Losers
                                </h3>

                                <span>
                                    NIFTY 50
                                </span>

                            </div>

                        </div>


                        <div className="stock-list">

                            {topLosers.length === 0 ? (

                                <div className="stock-list-empty">

                                    No losers available

                                </div>

                            ) : (

                                topLosers.map(
                                    (stock) =>
                                        renderStockRow(
                                            stock,
                                            "loser"
                                        )
                                )

                            )}

                        </div>

                    </div>

                </div>



                {/* ================================= */}
                {/* ALL NIFTY 50 STOCKS */}
                {/* ================================= */}

                <div className="overview-card">

                    <div className="card-header">

                        <div>

                            <h3>
                                NIFTY 50 Stocks
                            </h3>

                            <span>
                                Live Market Data
                            </span>

                        </div>

                        <strong>
                            {stocks.length} Stocks
                        </strong>

                    </div>


                    <div className="stock-list">


                        {stocks.length === 0 ? (

                            <div className="stock-list-empty">

                                No stock data available

                            </div>

                        ) : (

                            stocks.map(
                                (stock) =>
                                    renderStockRow(
                                        stock,
                                        "stock"
                                    )
                            )

                        )}

                    </div>

                </div>


            </div>

        </MainLayout>

    );

}


export default MarketOverview;