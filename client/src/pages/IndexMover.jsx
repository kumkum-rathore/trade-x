import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function IndexMover() {

    const [index, setIndex] =
        useState("NIFTY 50");

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchMovers = async (
        selectedIndex
    ) => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    `/index-movers?index=${encodeURIComponent(
                        selectedIndex
                    )}`
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
                "Failed to load index movers"
            );

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchMovers(index);

    }, [index]);


    return (

        <MainLayout>

            <div className="index-mover-page">

                <div className="page-header">

                    <h1>
                        Index Mover
                    </h1>

                    <p>
                        Top gainers and losers
                        in the selected index
                    </p>

                </div>


                <div className="index-selector">

                    <label>
                        Select Index
                    </label>

                    <select
                        value={index}
                        onChange={(e) =>
                            setIndex(
                                e.target.value
                            )
                        }
                    >

                        <option value="NIFTY 50">
                            NIFTY 50
                        </option>

                        <option value="SENSEX">
                            SENSEX
                        </option>

                        <option value="BANK NIFTY">
                            BANK NIFTY
                        </option>

                    </select>

                </div>


                {loading && (

                    <div className="index-loading">

                        Loading index movers...

                    </div>

                )}


                {error && (

                    <div className="index-error">

                        {error}

                    </div>

                )}


                {!loading &&
                    !error &&
                    data && (

                        <div className="movers-grid">

                            {/* GAINERS */}

                            <div className="mover-section">

                                <div className="mover-section-header">

                                    <h2>
                                        Top Gainers
                                    </h2>

                                    <span>
                                        {data.index}
                                    </span>

                                </div>


                                <div className="mover-list">

                                    {data.gainers.map(
                                        (stock) => (

                                            <div
                                                className="mover-row"
                                                key={
                                                    stock.symbol
                                                }
                                            >

                                                <div>

                                                    <strong>
                                                        {stock.symbol}
                                                    </strong>

                                                    <small>
                                                        {stock.name}
                                                    </small>

                                                </div>


                                                <div className="mover-price">

                                                    <span>
                                                        ₹
                                                        {stock.price.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </span>

                                                    <strong className="mover-positive">

                                                        +
                                                        {stock.changePercent}%

                                                    </strong>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* LOSERS */}

                            <div className="mover-section">

                                <div className="mover-section-header">

                                    <h2>
                                        Top Losers
                                    </h2>

                                    <span>
                                        {data.index}
                                    </span>

                                </div>


                                <div className="mover-list">

                                    {data.losers.map(
                                        (stock) => (

                                            <div
                                                className="mover-row"
                                                key={
                                                    stock.symbol
                                                }
                                            >

                                                <div>

                                                    <strong>
                                                        {stock.symbol}
                                                    </strong>

                                                    <small>
                                                        {stock.name}
                                                    </small>

                                                </div>


                                                <div className="mover-price">

                                                    <span>
                                                        ₹
                                                        {stock.price.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </span>

                                                    <strong className="mover-negative">

                                                        {stock.changePercent}%

                                                    </strong>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                    )}

            </div>

        </MainLayout>

    );

}


export default IndexMover;