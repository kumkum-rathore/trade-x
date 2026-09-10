
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function StockSearch() {

    const [symbol, setSymbol] = useState("");
    const [stock, setStock] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [watchlist, setWatchlist] = useState([]);
    const [watchlistMessage, setWatchlistMessage] = useState("");

    const navigate = useNavigate();


    // =====================================
    // FETCH WATCHLIST
    // =====================================

    useEffect(() => {

        const fetchWatchlist = async () => {

            try {

                const response = await api.get(
                    "/watchlist"
                );

                setWatchlist(
                    response.data.watchlist || []
                );

            } catch (error) {

                console.log(
                    "WATCHLIST ERROR:",
                    error
                );

            }

        };

        fetchWatchlist();

    }, []);


    // =====================================
    // CHECK WATCHLIST
    // =====================================

    const isInWatchlist = stock
        ? watchlist.some(
            (item) =>
                item.symbol === stock.symbol
        )
        : false;


    // =====================================
    // SEARCH REAL STOCK
    // =====================================

    const searchStock = async (e) => {

        e.preventDefault();

        const searchSymbol =
            symbol.trim().toUpperCase();

        if (!searchSymbol) {

            setError(
                "Please enter a stock symbol"
            );

            return;
        }


        try {

            setLoading(true);
            setError("");
            setStock(null);
            setWatchlistMessage("");


            // =================================
            // REAL MARKET DATA API
            // =================================

            const response = await api.get(
                `/market-data/stocks/${searchSymbol}`
            );


            console.log(
                "REAL SEARCH STOCK:",
                response.data
            );


            const stockData =
                response.data?.data;


            if (!stockData) {

                setError(
                    "Stock data not found"
                );

                return;
            }


            setStock(stockData);


        } catch (error) {

            console.log(
                "STOCK SEARCH ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Stock not found"
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // ADD TO WATCHLIST
    // =====================================

    const addToWatchlist = async () => {

        if (!stock) {
            return;
        }


        try {

            setWatchlistMessage("");


            const response =
                await api.post(
                    "/watchlist",
                    {
                        symbol: stock.symbol
                    }
                );


            setWatchlist(
                response.data.watchlist || []
            );


            setWatchlistMessage(
                `${stock.symbol} added to watchlist`
            );


        } catch (error) {

            console.log(
                "WATCHLIST ADD ERROR:",
                error
            );

            setWatchlistMessage(
                error.response?.data?.message ||
                "Failed to add stock"
            );

        }

    };


    // =====================================
    // VIEW DETAILS
    // =====================================

    const viewDetails = () => {

        if (!stock) {
            return;
        }

        navigate(
            `/stock/${stock.symbol}`
        );

    };


    // =====================================
    // UI
    // =====================================

    return (

        <section className="stock-search-section">


            {/* HEADER */}

            <div className="section-header">

                <div>

                    <h2>
                        Search Stock
                    </h2>

                    <p>
                        Search for real-time stock data
                    </p>

                </div>

            </div>


            {/* SEARCH FORM */}

            <form
                className="stock-search-form"
                onSubmit={searchStock}
            >

                <input
                    type="text"
                    placeholder="Enter symbol e.g. RELIANCE"
                    value={symbol}
                    onChange={(e) =>
                        setSymbol(e.target.value)
                    }
                />


                <button
                    type="submit"
                    disabled={loading}
                >

                    {loading
                        ? "Searching..."
                        : "Search"}

                </button>

            </form>


            {/* LOADING */}

            {loading && (

                <div className="stock-search-message">

                    Loading real market data...

                </div>

            )}


            {/* ERROR */}

            {error && !loading && (

                <div className="stock-search-error">

                    {error}

                </div>

            )}


            {/* STOCK RESULT */}

            {stock && !loading && !error && (

                <div className="stock-result-card">


                    {/* STOCK INFO */}

                    <div>

                        <h3>
                            {stock.name ||
                                stock.symbol}
                        </h3>


                        <small>
                            {stock.symbol}
                        </small>


                        <div className="stock-result-price">

                            ₹
                            {Number(
                                stock.price
                            ).toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}

                        </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="stock-result-actions">


                        {/* CHANGE */}

                        <div
                            className={
                                Number(stock.change) >= 0
                                    ? "market-positive"
                                    : "market-negative"
                            }
                        >

                            {Number(stock.change) >= 0
                                ? "+"
                                : ""}

                            {Number(
                                stock.change
                            ).toFixed(2)}

                            {" "}

                            (

                            {Number(
                                stock.changePercent
                            ) >= 0
                                ? "+"
                                : ""}

                            {Number(
                                stock.changePercent
                            ).toFixed(2)}

                            %)

                        </div>


                        {/* VIEW DETAILS */}

                        <button
                            type="button"
                            className="stock-detail-btn"
                            onClick={viewDetails}
                        >

                            View Details

                        </button>


                        {/* WATCHLIST */}

                        <button
                            type="button"
                            className="watchlist-add-btn"
                            onClick={addToWatchlist}
                            disabled={isInWatchlist}
                        >

                            {isInWatchlist
                                ? "★ Added"
                                : "☆ Add to Watchlist"}

                        </button>

                    </div>

                </div>

            )}


            {/* WATCHLIST MESSAGE */}

            {watchlistMessage && (

                <div className="watchlist-message">

                    {watchlistMessage}

                </div>

            )}

        </section>

    );

}

export default StockSearch;

