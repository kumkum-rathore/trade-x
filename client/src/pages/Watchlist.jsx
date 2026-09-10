import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

function Watchlist() {

    const [watchlist, setWatchlist] = useState([]);
    const [quotes, setQuotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
const navigate = useNavigate();
    const fetchWatchlist = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/watchlist"
            );

            const stocks =
                response.data.watchlist;

            setWatchlist(stocks);

            await fetchQuotes(stocks);

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load watchlist"
            );

        } finally {

            setLoading(false);

        }
    };


  const fetchQuotes = async (stocks) => {

    const quoteData = {};

    for (const stock of stocks) {

        try {

            const marketResponse =
                await api.get(
                    `/market-data/stocks/${stock.symbol}`
                );


            console.log(
                `WATCHLIST DATA - ${stock.symbol}:`,
                marketResponse.data
            );


            quoteData[stock.symbol] =
                marketResponse.data.data;


        } catch (error) {

            console.log(
                `Failed to fetch ${stock.symbol}`,
                error
            );

        }

    }

    setQuotes(quoteData);

};


    useEffect(() => {

        fetchWatchlist();

    }, []);


    const removeStock = async (symbol) => {

        try {

            const response =
                await api.delete(
                    `/watchlist/${symbol}`
                );

            setWatchlist(
                response.data.watchlist
            );

            const updatedStocks =
                response.data.watchlist;

            await fetchQuotes(
                updatedStocks
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to remove stock"
            );
        }
    };


    if (loading) {

        return (
            <MainLayout>

                <div className="watchlist-page">

                    <h1>My Watchlist</h1>

                    <div className="watchlist-loading">
                        Loading watchlist...
                    </div>

                </div>

            </MainLayout>
        );
    }


    return (

        <MainLayout>

            <div className="watchlist-page">

                <div className="page-header">

                    <h1>
                        My Watchlist
                    </h1>

                    <p>
                        Track your favourite stocks
                    </p>

                </div>


                {error && (

                    <div className="watchlist-error">
                        {error}
                    </div>

                )}


                {watchlist.length === 0 ? (

                    <div className="watchlist-empty">

                        <h3>
                            Your watchlist is empty
                        </h3>

                        <p>
                            Search for a stock and
                            add it to your watchlist.
                        </p>

                    </div>

                ) : (

                    <div className="watchlist-card">

                        <div className="watchlist-header">

                            <span>
                                Stock
                            </span>

                            <span>
                                Price
                            </span>

                            <span>
                                Change
                            </span>

                            <span>
                                Action
                            </span>

                        </div>


                        {watchlist.map((stock) => {

                            const quote =
                                quotes[stock.symbol];


                            return (

                                <div
                                    className="watchlist-row"
                                    key={stock.symbol}
                                >

                                    <strong
    className="watchlist-symbol"
    onClick={() =>
        navigate(
            `/stock/${stock.symbol}`
        )
    }
>
    {stock.symbol}
</strong>


                                    <span>

                                        {quote
                                            ? `₹${quote.price.toLocaleString(
                                                "en-IN"
                                            )}`
                                            : "Loading..."}

                                    </span>


                                    <span
                                        className={
                                            quote
                                                ? (
                                                    quote.change >= 0
                                                        ? "market-positive"
                                                        : "market-negative"
                                                )
                                                : ""
                                        }
                                    >

                                        {quote
                                            ? `${quote.change >= 0 ? "+" : ""}${quote.changePercent}%`
                                            : "—"}

                                    </span>


                                    <button
                                        className="watchlist-remove-btn"
                                        onClick={() =>
                                            removeStock(
                                                stock.symbol
                                            )
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>

                            );

                        })}

                    </div>

                )}


                {watchlist.length > 0 && (

                    <button
                        className="refresh-watchlist-btn"
                        onClick={fetchWatchlist}
                    >
                        Refresh Prices
                    </button>

                )}

            </div>

        </MainLayout>
    );
}

export default Watchlist;