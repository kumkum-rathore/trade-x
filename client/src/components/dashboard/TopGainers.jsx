import {
    useEffect,
    useState
} from "react";

import api from "../../services/api";


function TopGainers() {

    const [stocks, setStocks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchTopGainers = async () => {

        try {

            setLoading(true);
            setError("");


            const response =
                await api.get(
                    "/market-data/stocks"
                );


            console.log(
                "CENTRAL TOP GAINERS:",
                response.data
            );


            const marketStocks =
                response.data.data || [];


            const gainers =
                marketStocks
                    .filter(
                        (stock) =>
                            stock.changePercent > 0
                    )
                    .sort(
                        (a, b) =>
                            b.changePercent -
                            a.changePercent
                    );
                    


            setStocks(gainers);


        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load top gainers"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchTopGainers();

    }, []);


    if (loading) {

        return (

            <div className="stock-list-card">

                <div className="card-header">

                    <h3>
                        Top Gainers
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
                        Top Gainers
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
                    Top Gainers
                </h3>

                <span>
                    Today
                </span>

            </div>


            <div className="stock-list">



                {stocks.length === 0 ? (

    <div className="stock-list-empty">

        No gainers available

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

            <span className="positive">

                +
                {stock.changePercent}%

            </span>

        </div>

    ))

)}


            </div>

        </div>

    );

}


export default TopGainers;