import {
    useEffect,
    useState
} from "react";

import api from "../../services/api";


function MarketDistribution() {

    const [distribution, setDistribution] =
        useState({
            total: 0,
            advances: 0,
            declines: 0,
            unchanged: 0
        });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================
    // FETCH NIFTY 50 BREADTH
    // =====================================

    const fetchDistribution = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get(
                    "/market-data/breadth"
                );

            console.log(
                "NIFTY 50 BREADTH:",
                response.data
            );


            const data =
                response.data?.data;


            if (!data) {

                throw new Error(
                    "Breadth data not received"
                );

            }


            setDistribution({

                total:
                    Number(data.total || 0),

                advances:
                    Number(data.advances || 0),

                declines:
                    Number(data.declines || 0),

                unchanged:
                    Number(data.unchanged || 0)

            });


        } catch (error) {

            console.log(
                "BREADTH API ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load NIFTY 50 breadth"
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // INITIAL LOAD
    // =====================================

    useEffect(() => {

        fetchDistribution();

    }, []);


    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (

            <div className="distribution-card">

                <div className="card-header">

                    <h3>
                        Market Distribution
                    </h3>

                    <span>
                        NIFTY 50
                    </span>

                </div>


                <div className="distribution-stats">

                    Loading real NIFTY 50 data...

                </div>

            </div>

        );

    }


    // =====================================
    // ERROR
    // =====================================

    if (error) {

        return (

            <div className="distribution-card">

                <div className="card-header">

                    <h3>
                        Market Distribution
                    </h3>

                    <span>
                        NIFTY 50
                    </span>

                </div>


                <div className="distribution-stats">

                    <div>
                        {error}
                    </div>


                    <button
                        onClick={fetchDistribution}
                        className="refresh-market-btn"
                    >
                        Retry
                    </button>

                </div>

            </div>

        );

    }


    // =====================================
    // UI
    // =====================================

    return (

        <div className="distribution-card">


            {/* HEADER */}

            <div className="card-header">

                <div>

                    <h3>
                        Market Distribution
                    </h3>

                    <span>
                        NIFTY 50
                    </span>

                </div>


                <button
                    onClick={fetchDistribution}
                    className="refresh-market-btn"
                >
                    Refresh
                </button>

            </div>


            {/* TOTAL */}

            <div className="distribution-total">

                <strong>
                    {distribution.total}
                </strong>

                <span>
                    Total Stocks
                </span>

            </div>


            {/* ADVANCES / DECLINES / UNCHANGED */}

            <div className="distribution-stats">


                {/* ADVANCES */}

                <div className="distribution-item">

                    <strong>
                        {distribution.advances}
                    </strong>

                    <span>
                        Advances
                    </span>

                </div>


                {/* DECLINES */}

                <div className="distribution-item">

                    <strong>
                        {distribution.declines}
                    </strong>

                    <span>
                        Declines
                    </span>

                </div>


                {/* UNCHANGED */}

                <div className="distribution-item">

                    <strong>
                        {distribution.unchanged}
                    </strong>

                    <span>
                        Unchanged
                    </span>

                </div>


            </div>


            {/* VALIDATION */}

            <div className="distribution-footer">

                <span>
                    Advances + Declines + Unchanged
                </span>

                <strong>

                    {distribution.advances +
                     distribution.declines +
                     distribution.unchanged}

                    {" / "}

                    {distribution.total}

                </strong>

            </div>


        </div>

    );

}


export default MarketDistribution;