import {
    useEffect,
    useState
} from "react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import api from "../../services/api";


function MarketChart() {

    const [index, setIndex] =
        useState(null);

    const [chartData, setChartData] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [timeframe, setTimeframe] =
        useState("1D");


    // =====================================
    // FETCH MARKET DATA
    // =====================================

    const fetchMarketData = async () => {

        try {

            setLoading(true);
            setError("");


            // =================================
            // GET NIFTY CURRENT DATA
            // =================================

            const indexResponse =
                await api.get(
                    "/market-data/indices"
                );


            console.log(
                "REAL MARKET INDICES:",
                indexResponse.data
            );


            const indices =
                indexResponse.data?.data || [];


            const nifty =
                indices.find(
                    (item) =>
                        item.symbol === "NIFTY50"
                );


            setIndex(nifty || null);


            // =================================
            // GET NIFTY HISTORICAL DATA
            // =================================
            //
            // IMPORTANT:
            //
            // Backend route is:
            //
            // /api/market-data/history/:symbol
            //
            // NOT:
            //
            // /api/market/history/:symbol
            //
            // =================================

            const historyResponse =
                await api.get(
                    `/market-data/history/NIFTY50?timeframe=${timeframe}`
                );


            console.log(
                "REAL NIFTY HISTORY:",
                historyResponse.data
            );


            const history =
                historyResponse.data?.data || [];


            console.log(
                "NIFTY HISTORY ARRAY:",
                history
            );


            // =================================
            // PREPARE CHART DATA
            // =================================

            const formattedHistory =
                history
                    .map((item) => ({

                        time: item.time,

                        price:
                            Number(
                                item.close ??
                                item.price ??
                                0
                            ),

                        open:
                            Number(
                                item.open ?? 0
                            ),

                        high:
                            Number(
                                item.high ?? 0
                            ),

                        low:
                            Number(
                                item.low ?? 0
                            ),

                        close:
                            Number(
                                item.close ?? 0
                            ),

                        volume:
                            Number(
                                item.volume ?? 0
                            )

                    }))
                    .filter(
                        (item) =>
                            item.price > 0
                    );


            setChartData(
                formattedHistory
            );


        } catch (error) {

            console.log(
                "MARKET CHART ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to load market chart"
            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // TIMEFRAME CHANGE
    // =====================================

    useEffect(() => {

        fetchMarketData();

    }, [timeframe]);


    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (

            <div className="chart-card">

                <div className="chart-header">

                    <div>

                        <h3>
                            NIFTY 50
                        </h3>

                        <div className="chart-price">

                            Loading...

                        </div>

                    </div>

                </div>


                <div className="chart-container">

                    Loading market chart...

                </div>

            </div>

        );

    }


    // =====================================
    // ERROR
    // =====================================

    if (error) {

        return (

            <div className="chart-card">

                <div className="chart-header">

                    <div>

                        <h3>
                            NIFTY 50
                        </h3>

                    </div>

                </div>


                <div className="chart-container">

                    {error}

                </div>

            </div>

        );

    }


    // =====================================
    // UI
    // =====================================

    return (

        <div className="chart-card">


            {/* ================================
                HEADER
            ================================= */}

            <div className="chart-header">


                <div>

                    <h3>

                        {index?.name ||
                            "NIFTY 50"}

                    </h3>


                    <div className="chart-price">

                        ₹
                        {index?.value
                            ? Number(
                                index.value
                            ).toLocaleString(
                                "en-IN"
                            )
                            : "—"
                        }

                    </div>


                    <span
                        className={
                            Number(
                                index?.change
                            ) >= 0
                                ? "positive"
                                : "negative"
                        }
                    >

                        {Number(
                            index?.change
                        ) >= 0
                            ? "+"
                            : ""
                        }

                        {index?.changePercent ?? 0}%

                    </span>

                </div>


                {/* ================================
                    TIMEFRAME BUTTONS
                ================================= */}

                <div className="chart-periods">

                    {[
                        "1D",
                        "1W",
                        "1M",
                        "3M",
                        "1Y"
                    ].map(
                        (period) => (

                            <button
                                key={period}

                                className={
                                    timeframe ===
                                    period
                                        ? "active"
                                        : ""
                                }

                                onClick={() =>
                                    setTimeframe(
                                        period
                                    )
                                }
                            >

                                {period}

                            </button>

                        )
                    )}

                </div>

            </div>


            {/* ================================
                NO DATA
            ================================= */}

            {chartData.length === 0 ? (

                <div className="chart-container">

                    No chart data available
                    for {timeframe}.

                </div>

            ) : (


                /* =============================
                   CHART
                ============================== */

                <div className="chart-container">

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <LineChart
                            data={chartData}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />


                            <XAxis
                                dataKey="time"
                            />


                            <YAxis
                                domain={[
                                    "auto",
                                    "auto"
                                ]}
                                tickFormatter={
                                    (value) =>
                                        Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )
                                }
                            />


                            <Tooltip
                                formatter={
                                    (value) => [

                                        `₹${Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )}`,

                                        "Price"

                                    ]
                                }
                            />


                            <Line
                                type="monotone"

                                dataKey="price"

                                strokeWidth={2}

                                dot={false}

                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            )}

        </div>

    );

}


export default MarketChart;