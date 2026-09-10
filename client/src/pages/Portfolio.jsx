
import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function Portfolio() {

    const [portfolio, setPortfolio] =
        useState([]);

    const [quotes, setQuotes] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

        const [showAddForm, setShowAddForm] =
    useState(false);

const [symbol, setSymbol] =
    useState("");

const [quantity, setQuantity] =
    useState("");

const [averagePrice, setAveragePrice] =
    useState("");

const [adding, setAdding] =
    useState(false);


    const fetchPortfolio = async () => {
    try {
        setLoading(true);

        const response = await api.get("/portfolio");

        console.log("PORTFOLIO API RESPONSE:", response.data);

        const holdings = response.data.data;

        console.log("HOLDINGS:", holdings);

        setPortfolio(holdings);

        await fetchQuotes(holdings);

    } catch (error) {
        console.log("PORTFOLIO ERROR:", error);

        setError(
            error.response?.data?.message ||
            "Failed to load portfolio"
        );
    } finally {
        setLoading(false);
    }
};


    const fetchQuotes = async (
        holdings
    ) => {

        const quoteData = {};


        for (
            const holding of holdings
        ) {

            try {

                const response =
                    await api.get(
                        `/market/quote/${holding.symbol}`
                    );

                quoteData[
                    holding.symbol
                ] =
                    response.data.data;


            } catch (error) {

                console.log(error);

            }
        }


        setQuotes(quoteData);
    };


    useEffect(() => {

        fetchPortfolio();

    }, []);


    const addHolding = async (e) => {

    e.preventDefault();

    try {

        setAdding(true);

        setError("");

        const response =
            await api.post(
                "/portfolio",
                {
                    symbol:
                        symbol.toUpperCase(),

                    quantity:
                        Number(quantity),

                    averagePrice:
                        Number(averagePrice)
                }
            );


        console.log(
            "ADD HOLDING:",
            response.data
        );


        setSymbol("");

        setQuantity("");

        setAveragePrice("");

        setShowAddForm(false);


        await fetchPortfolio();


    } catch (error) {

        console.log(error);

        setError(
            error.response?.data?.message ||
            "Failed to add holding"
        );


    } finally {

        setAdding(false);

    }
};

    const removeHolding = async (
        symbol
    ) => {

        try {

            const response =
                await api.delete(
                    `/portfolio/${symbol}`
                );

            setPortfolio(
                response.data.data
            );

            await fetchQuotes(
                response.data.data
            );


        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to remove holding"
            );
        }
    };


    let totalInvested = 0;

    let totalCurrent = 0;


    portfolio.forEach(
        (holding) => {

            const quote =
                quotes[holding.symbol];


            totalInvested +=
                holding.quantity *
                holding.averagePrice;


            if (quote) {

                totalCurrent +=
                    holding.quantity *
                    quote.price;

            }

        }
    );


    const totalPnL =
        totalCurrent -
        totalInvested;


    if (loading) {

        return (

            <MainLayout>

                <div className="portfolio-page">

                    <div className="portfolio-empty">

                        Loading portfolio...

                    </div>

                </div>

            </MainLayout>
        );
    }


    return (

        <MainLayout>

            <div className="portfolio-page">


               <div className="portfolio-page-header">

    <div>

        <h1>
            My Portfolio
        </h1>

        <p>
            Track your holdings
            and performance
        </p>

    </div>


    <button
        className="add-stock-btn"
        onClick={() =>
            setShowAddForm(true)
        }
    >
        + Add Stock
    </button>

</div>


                {error && (

                    <div className="portfolio-error">

                        {error}

                    </div>

                )}


                {showAddForm && (

    <div className="add-stock-card">

        <div className="add-stock-header">

            <h2>
                Add Stock
            </h2>

            <button
                onClick={() =>
                    setShowAddForm(false)
                }
            >
                ×
            </button>

        </div>


        <form
            onSubmit={addHolding}
            className="add-stock-form"
        >

            <div className="form-group">

                <label>
                    Stock Symbol
                </label>

                <input
                    type="text"
                    placeholder="RELIANCE"
                    value={symbol}
                    onChange={(e) =>
                        setSymbol(
                            e.target.value
                        )
                    }
                    required
                />

            </div>


            <div className="form-group">

                <label>
                    Quantity
                </label>

                <input
                    type="number"
                    placeholder="10"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                        setQuantity(
                            e.target.value
                        )
                    }
                    required
                />

            </div>


            <div className="form-group">

                <label>
                    Average Buy Price
                </label>

                <input
                    type="number"
                    placeholder="1400"
                    min="0"
                    step="0.01"
                    value={averagePrice}
                    onChange={(e) =>
                        setAveragePrice(
                            e.target.value
                        )
                    }
                    required
                />

            </div>


            <div className="add-stock-actions">

                <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                        setShowAddForm(false)
                    }
                >
                    Cancel
                </button>


                <button
                    type="submit"
                    className="submit-stock-btn"
                    disabled={adding}
                >
                    {adding
                        ? "Adding..."
                        : "Add Stock"}
                </button>

            </div>

        </form>

    </div>

)}


                {/* SUMMARY */}

                <div className="portfolio-summary">


                    <div className="portfolio-summary-card">

                        <span>
                            Invested
                        </span>

                        <strong>
                            ₹
                            {totalInvested.toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                    </div>


                    <div className="portfolio-summary-card">

                        <span>
                            Current Value
                        </span>

                        <strong>
                            ₹
                            {totalCurrent.toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                    </div>


                    <div className="portfolio-summary-card">

                        <span>
                            Total P&L
                        </span>

                        <strong
                            className={
                                totalPnL >= 0
                                    ? "market-positive"
                                    : "market-negative"
                            }
                        >

                            {totalPnL >= 0
                                ? "+"
                                : ""}

                            ₹
                            {totalPnL.toLocaleString(
                                "en-IN"
                            )}

                        </strong>

                    </div>

                </div>


                {/* HOLDINGS */}

                {portfolio.length === 0 ? (

                    <div className="portfolio-empty">

                        <h3>
                            No holdings yet
                        </h3>

                        <p>
                            Add your first stock
                            to start tracking
                            your portfolio.
                        </p>

                    </div>

                ) : (

                    <div className="portfolio-card">

                        <div className="portfolio-header">

                            <span>
                                Stock
                            </span>

                            <span>
                                Qty
                            </span>

                            <span>
                                Avg Price
                            </span>

                            <span>
                                LTP
                            </span>

                            <span>
                                P&L
                            </span>

                            <span>
                                Action
                            </span>

                        </div>


                        {portfolio.map(
                            (holding) => {

                                const quote =
                                    quotes[
                                        holding.symbol
                                    ];


                                const invested =
                                    holding.quantity *
                                    holding.averagePrice;


                                const current =
                                    quote
                                        ? holding.quantity *
                                          quote.price
                                        : 0;


                                const pnl =
                                    current -
                                    invested;


                                return (

                                    <div
                                        className="portfolio-row"
                                        key={
                                            holding.symbol
                                        }
                                    >

                                        <strong>
                                            {holding.symbol}
                                        </strong>


                                        <span>
                                            {holding.quantity}
                                        </span>


                                        <span>
                                            ₹
                                            {holding.averagePrice.toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>


                                        <span>
                                            {quote
                                                ? `₹${quote.price.toLocaleString(
                                                    "en-IN"
                                                )}`
                                                : "Loading..."}
                                        </span>


                                        <span
                                            className={
                                                pnl >= 0
                                                    ? "market-positive"
                                                    : "market-negative"
                                            }
                                        >

                                            {pnl >= 0
                                                ? "+"
                                                : ""}

                                            ₹
                                            {pnl.toLocaleString(
                                                "en-IN"
                                            )}

                                        </span>


                                        <button
                                            className="portfolio-remove-btn"
                                            onClick={() =>
                                                removeHolding(
                                                    holding.symbol
                                                )
                                            }
                                        >
                                            Remove
                                        </button>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}


                {portfolio.length > 0 && (

                    <button
                        className="refresh-portfolio-btn"
                        onClick={
                            fetchPortfolio
                        }
                    >
                        Refresh Prices
                    </button>

                )}

            </div>

        </MainLayout>
    );
}


export default Portfolio;