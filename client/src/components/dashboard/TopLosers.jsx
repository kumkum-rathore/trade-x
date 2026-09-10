import {
    useEffect,
    useState
} from "react";

import api from "../../services/api";


function TopLosers() {

    const [stocks, setStocks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchTopLosers = async () => {

        try {

            setLoading(true);
            setError("");


            const response =
                await api.get(
                    "/market-data/stocks"
                );


            console.log(
                "CENTRAL TOP LOSERS:",
                response.data
            );


            const marketStocks =
                response.data.data || [];


            const losers =
                marketStocks
                    .filter(
                        (stock) =>
                            stock.changePercent < 0
                    )
                    .sort(
                        (a, b) =>
                            a.changePercent -
                            b.changePercent
                    )
                    ;


            setStocks(losers);


        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load top losers"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchTopLosers();

    }, []);


    if (loading) {

        return (

            <div className="stock-list-card">

                <div className="card-header">

                    <h3>
                        Top Losers
                    </h3>

                    <span>
                        Today
                    </span>

                </div>

                <div className="stock-list">

                    Loading...

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="stock-list-card">

                <div className="card-header">

                    <h3>
                        Top Losers
                    </h3>

                    <span>
                        Today
                    </span>

                </div>

                <div className="stock-list">

                    {error}

                </div>

            </div>

        );

    }


    return (

        <div className="stock-list-card">

            <div className="card-header">

                <h3>
                    Top Losers
                </h3>

                <span>
                    Today
                </span>

            </div>


            <div className="stock-list">

                {stocks.length === 0 ? (

    <div className="stock-list-empty">

        No losers available

    </div>

) : (

    stocks.map((stock) => (

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
                    {stock.price.toLocaleString(
                        "en-IN"
                    )}
                </small>

            </div>

            <span className="negative">

                {stock.changePercent}%

            </span>

        </div>

    ))

)}


            </div>

        </div>

    );

}


export default TopLosers;