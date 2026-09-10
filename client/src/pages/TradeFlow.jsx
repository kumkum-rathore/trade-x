import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function TradeFlow() {

    // =====================================================
    // STATE
    // =====================================================

    const [type, setType] =
        useState("all");

    const [stocks, setStocks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [sortBy, setSortBy] =
        useState("volume");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [lastUpdated, setLastUpdated] =
        useState(null);

    const [expiresAt, setExpiresAt] =
        useState(null);

    const [marketStatus, setMarketStatus] =
        useState({
            isOpen: false,
            status: "CLOSED",
            reason: "Market closed"
        });

    const [autoRefresh, setAutoRefresh] =
        useState(true);

    const [countdown, setCountdown] =
        useState(0);


    // Prevent duplicate frontend requests

    const requestRef =
        useRef(false);


    const ITEMS_PER_PAGE = 25;


    // =====================================================
    // FETCH TRADE FLOW
    // =====================================================

    const fetchTradeFlow =
        useCallback(
            async (
                showLoader = true,
                forceRefresh = false
            ) => {

                // Prevent duplicate requests

                if (
                    requestRef.current
                ) {

                    return;

                }


                requestRef.current = true;


                try {

                    if (showLoader) {

                        setLoading(true);

                    }
                    else {

                        setRefreshing(true);

                    }


                    setError("");


                    const response =
                        await api.get(
                            `/market-data/trade-flow?type=${type}&forceRefresh=${forceRefresh}`
                        );


                    console.log(
                        "TRADE FLOW RESPONSE:",
                        response.data
                    );


                    const data =
                        response.data?.data;


                    const receivedStocks =
                        Array.isArray(
                            data?.stocks
                        )
                            ? data.stocks
                            : [];


                    setStocks(
                        receivedStocks
                    );


                    setLastUpdated(
                        data?.updatedAt ||
                        null
                    );


                    setExpiresAt(
                        data?.expiresAt ||
                        null
                    );


                    setMarketStatus(
                        data?.marketStatus ||
                        {
                            isOpen: false,
                            status: "CLOSED",
                            reason: "Market closed"
                        }
                    );


                    // ==========================================
                    // COUNTDOWN
                    // ==========================================

                    if (
                        data?.expiresAt
                    ) {

                        const remaining =
                            Math.max(
                                0,
                                Math.ceil(
                                    (
                                        new Date(
                                            data.expiresAt
                                        ).getTime() -
                                        Date.now()
                                    ) / 1000
                                )
                            );


                        setCountdown(
                            remaining
                        );

                    }


                }
                catch (error) {

                    console.error(
                        "TRADE FLOW ERROR:",
                        error
                    );


                    setError(
                        error.response?.data?.message ||
                        "Failed to load Trade Flow"
                    );

                }
                finally {

                    setLoading(false);

                    setRefreshing(false);

                    requestRef.current =
                        false;

                }

            },
            [type]
        );


    // =====================================================
    // INITIAL LOAD / TYPE CHANGE
    // =====================================================

    useEffect(() => {

        setCurrentPage(1);

        fetchTradeFlow(
            true,
            false
        );

    }, [fetchTradeFlow]);


    // =====================================================
    // COUNTDOWN
    // =====================================================

    useEffect(() => {

        if (
            !expiresAt
        ) {

            return;

        }


        const timer =
            setInterval(
                () => {

                    const remaining =
                        Math.max(
                            0,
                            Math.ceil(
                                (
                                    new Date(
                                        expiresAt
                                    ).getTime() -
                                    Date.now()
                                ) / 1000
                            )
                        );


                    setCountdown(
                        remaining
                    );

                },
                1000
            );


        return () => {

            clearInterval(
                timer
            );

        };

    }, [expiresAt]);


    // =====================================================
    // AUTO REFRESH
    // =====================================================

    useEffect(() => {

        if (
            !autoRefresh
        ) {

            return;

        }


        if (
            !marketStatus?.isOpen
        ) {

            return;

        }


        const timer =
            setInterval(
                () => {

                    if (
                        countdown <= 0 &&
                        !requestRef.current
                    ) {

                        fetchTradeFlow(
                            false,
                            false
                        );

                    }

                },
                1000
            );


        return () => {

            clearInterval(
                timer
            );

        };

    }, [
        autoRefresh,
        marketStatus?.isOpen,
        countdown,
        fetchTradeFlow
    ]);


    // =====================================================
    // SEARCH + SORT
    // =====================================================

    const filteredStocks =
        useMemo(() => {

            let result =
                [...stocks];


            // ==========================================
            // SEARCH
            // ==========================================

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            if (
                searchValue
            ) {

                result =
                    result.filter(
                        stock => {

                            const text =
                                `
                                ${stock.symbol || ""}
                                ${stock.name || ""}
                                ${stock.tradingSymbol || ""}
                                `
                                    .toLowerCase();


                            return text.includes(
                                searchValue
                            );

                        }
                    );

            }


            // ==========================================
            // SORT
            // ==========================================

            if (
                sortBy === "volume"
            ) {

                result.sort(
                    (a, b) =>
                        Number(
                            b.volume || 0
                        ) -
                        Number(
                            a.volume || 0
                        )
                );

            }


            if (
                sortBy === "change"
            ) {

                result.sort(
                    (a, b) =>
                        Number(
                            b.changePercent || 0
                        ) -
                        Number(
                            a.changePercent || 0
                        )
                );

            }


            if (
                sortBy === "xFactor"
            ) {

                result.sort(
                    (a, b) =>
                        Number(
                            b.xFactor || 0
                        ) -
                        Number(
                            a.xFactor || 0
                        )
                );

            }


            if (
                sortBy === "price"
            ) {

                result.sort(
                    (a, b) =>
                        Number(
                            b.price || 0
                        ) -
                        Number(
                            a.price || 0
                        )
                );

            }


            return result;

        }, [
            stocks,
            search,
            sortBy
        ]);


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.ceil(
            filteredStocks.length /
            ITEMS_PER_PAGE
        );


    const safePage =
        Math.min(
            currentPage,
            Math.max(
                totalPages,
                1
            )
        );


    const startIndex =
        (safePage - 1) *
        ITEMS_PER_PAGE;


    const paginatedStocks =
        filteredStocks.slice(
            startIndex,
            startIndex +
            ITEMS_PER_PAGE
        );


    // =====================================================
    // MARKET COUNTS
    // =====================================================

    const upCount =
        stocks.filter(
            stock =>
                Number(
                    stock.changePercent || 0
                ) > 0
        ).length;


    const downCount =
        stocks.filter(
            stock =>
                Number(
                    stock.changePercent || 0
                ) < 0
        ).length;


    const unchangedCount =
        stocks.filter(
            stock =>
                Number(
                    stock.changePercent || 0
                ) === 0
        ).length;


    const total =
        stocks.length;


    const upPercentage =
        total > 0
            ? (
                upCount /
                total
            ) * 100
            : 0;


    const downPercentage =
        total > 0
            ? (
                downCount /
                total
            ) * 100
            : 0;


    const unchangedPercentage =
        total > 0
            ? (
                unchangedCount /
                total
            ) * 100
            : 0;


    // =====================================================
    // SIGNAL CLASS
    // =====================================================

    const getSignalClass =
        (signal) => {

            const value =
                String(
                    signal || ""
                );


            if (
                value === "Breakout" ||
                value === "Momentum" ||
                value === "Volume Shock"
            ) {

                return "trade-signal-positive";

            }


            if (
                value === "Selling Shock" ||
                value === "Weakness"
            ) {

                return "trade-signal-negative";

            }


            return "trade-signal-neutral";

        };


    // =====================================================
    // X FACTOR
    // =====================================================

    const getXFactor =
        (value) => {

            const x =
                Number(value);


            if (
                !Number.isFinite(x) ||
                x <= 0
            ) {

                return null;

            }


            return x;

        };


    // =====================================================
    // ACTIVITY LEVEL
    // =====================================================

    const getActivityLevel =
        (xFactor) => {

            const value =
                getXFactor(
                    xFactor
                );


            if (
                value === null
            ) {

                return 0;

            }


            if (
                value >= 4
            ) {

                return 5;

            }


            if (
                value >= 3
            ) {

                return 4;

            }


            if (
                value >= 2
            ) {

                return 3;

            }


            if (
                value >= 1.3
            ) {

                return 2;

            }


            return 1;

        };


    // =====================================================
    // FORMAT VOLUME
    // =====================================================

    const formatVolume =
        (volume) => {

            const value =
                Number(
                    volume || 0
                );


            if (
                value >= 10000000
            ) {

                return (
                    `${(
                        value /
                        10000000
                    ).toFixed(2)} Cr`
                );

            }


            if (
                value >= 100000
            ) {

                return (
                    `${(
                        value /
                        100000
                    ).toFixed(2)} L`
                );

            }


            if (
                value >= 1000
            ) {

                return (
                    `${(
                        value /
                        1000
                    ).toFixed(2)} K`
                );

            }


            return value.toLocaleString(
                "en-IN"
            );

        };


    // =====================================================
    // FORMAT TIME
    // =====================================================

    const formatTime =
        (time) => {

            if (
                !time
            ) {

                return "--:--:--";

            }


            const date =
                new Date(time);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return String(time);

            }


            return date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            );

        };


    // =====================================================
    // CHANGE PAGE
    // =====================================================

    const changePage =
        (page) => {

            if (
                page < 1 ||
                page > totalPages
            ) {

                return;

            }


            setCurrentPage(
                page
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        };


    // =====================================================
    // MARKET STATUS UI
    // =====================================================

    const isMarketOpen =
        marketStatus?.isOpen === true;


    const marketStatusText =
        isMarketOpen
            ? "LIVE"
            : marketStatus?.status === "PRE_OPEN"
                ? "PRE-OPEN"
                : "MARKET CLOSED";


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <MainLayout>

                <div className="trade-flow-page">

                    <div className="trade-flow-loading">

                        <div className="trade-flow-loader" />

                        <h3>
                            Loading live market activity...
                        </h3>

                        <p>
                            Scanning active NSE stocks
                        </p>

                    </div>

                </div>

            </MainLayout>

        );

    }


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <MainLayout>

            <div className="trade-flow-page">


                {/* =========================================
                    TOP BAR
                ========================================= */}

                <div className="trade-flow-topbar">


                    {/* STOCK TYPE */}

                    <div className="trade-flow-toggle">

                        <button
                            className={
                                type === "all"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => {

                                if (
                                    type !== "all"
                                ) {

                                    setType("all");

                                    setCurrentPage(1);

                                }

                            }}
                        >

                            All Stocks

                            <span>
                                {type === "all"
                                    ? stocks.length
                                    : ""}
                            </span>

                        </button>


                        <button
                            className={
                                type === "fno"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => {

                                if (
                                    type !== "fno"
                                ) {

                                    setType("fno");

                                    setCurrentPage(1);

                                }

                            }}
                        >

                            F&O

                        </button>

                    </div>


                    {/* REFRESH */}

                    <div className="trade-flow-refresh">


                        <label>

                            <input
                                type="checkbox"
                                checked={
                                    autoRefresh
                                }
                                onChange={(e) =>
                                    setAutoRefresh(
                                        e.target.checked
                                    )
                                }
                            />

                            Auto Refresh

                        </label>


                        <button
                            onClick={() =>
                                fetchTradeFlow(
                                    false,
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                            className="refresh-market-btn"
                        >

                            {refreshing
                                ? "↻ Refreshing..."
                                : "↻ Refresh"}

                        </button>

                    </div>

                </div>


                {/* =========================================
                    MAIN CARD
                ========================================= */}

                <div className="trade-flow-card">


                    {/* HEADER */}

                    <div className="trade-flow-header">

                        <div>

                            <div className="trade-flow-title">

                                <h1>
                                    MARKET ROCKERS
                                </h1>


                                <span
                                    className={
                                        isMarketOpen
                                            ? "live-badge"
                                            : "live-badge market-closed-badge"
                                    }
                                >

                                    {isMarketOpen
                                        ? "● LIVE"
                                        : marketStatusText}

                                </span>

                            </div>


                            <p className="trade-flow-subtitle">

                                Real-time market activity,
                                volume shocks and momentum scanner

                            </p>

                        </div>


                        <div className="trade-flow-actions">


                            {/* SEARCH */}

                            <div className="trade-flow-search">

                                <span>
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search stock..."
                                    value={search}
                                    onChange={(e) => {

                                        setSearch(
                                            e.target.value
                                        );

                                        setCurrentPage(
                                            1
                                        );

                                    }}
                                />

                            </div>


                            {/* SORT */}

                            <select
                                value={sortBy}
                                onChange={(e) => {

                                    setSortBy(
                                        e.target.value
                                    );

                                    setCurrentPage(
                                        1
                                    );

                                }}
                                className="trade-flow-sort"
                            >

                                <option value="volume">
                                    Highest Volume
                                </option>

                                <option value="change">
                                    Highest Change
                                </option>

                                <option value="xFactor">
                                    Highest X Factor
                                </option>

                                <option value="price">
                                    Highest Price
                                </option>

                            </select>


                           

                        </div>

                    </div>


                    {/* =========================================
                        REFRESH STATUS
                    ========================================= */}

                    <div className="trade-flow-live-status">

                        <div>

                            <span>
                                {isMarketOpen
                                    ? "Market Status"
                                    : "Market Status"}
                            </span>

                            <strong
                                className={
                                    isMarketOpen
                                        ? "status-live"
                                        : "status-closed"
                                }
                            >

                                {marketStatusText}

                            </strong>

                        </div>


                        <div>

                            <span>
                                Last update
                            </span>

                            <strong>
                                {formatTime(
                                    lastUpdated
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                {isMarketOpen
                                    ? "Next scan"
                                    : "Refresh"}
                            </span>

                            <strong>

                                {isMarketOpen
                                    ? `${countdown}s`
                                    : "N/A"}

                            </strong>

                        </div>

                    </div>


                    {/* =========================================
                        MARKET SUMMARY
                    ========================================= */}

                    <div className="trade-flow-summary">

                        <div className="summary-heading">

                            <strong>
                                Market Activity
                            </strong>

                            <span>
                                {total} active stocks
                            </span>

                        </div>


                        <div className="summary-bar">

                            <div
                                className="summary-up"
                                style={{
                                    width:
                                        `${upPercentage}%`
                                }}
                            />


                            <div
                                className="summary-down"
                                style={{
                                    width:
                                        `${downPercentage}%`
                                }}
                            />


                            <div
                                className="summary-unchanged"
                                style={{
                                    width:
                                        `${unchangedPercentage}%`
                                }}
                            />

                        </div>


                        <div className="summary-counts">

                            <span className="up-count">

                                <i />

                                {upCount}

                                {" "}

                                Stocks Up

                                {" ("}

                                {upPercentage.toFixed(1)}

                                {"%)"}

                            </span>


                            <span className="down-count">

                                <i />

                                {downCount}

                                {" "}

                                Stocks Down

                                {" ("}

                                {downPercentage.toFixed(1)}

                                {"%)"}

                            </span>


                            <span className="unchanged-count">

                                <i />

                                {unchangedCount}

                                {" "}

                                Unchanged

                            </span>

                        </div>

                    </div>


                    {/* =========================================
                        INFO
                    ========================================= */}

                    <div className="trade-flow-info">

                        <div>

                            <strong>
                                Market Rockers & Shockers
                            </strong>

                            <span>
                                Stocks showing unusual
                                price and volume activity
                            </span>

                        </div>


                        <div className="trade-flow-last-update">

                            <span>
                                Market
                            </span>

                            <strong>
                                {marketStatus?.reason ||
                                    "Market status unavailable"}
                            </strong>

                        </div>

                    </div>


                    {/* =========================================
                        TABLE
                    ========================================= */}

                    <div className="trade-flow-table">


                        {/* HEADER */}

                        <div className="trade-flow-table-header">

                            <div>
                                SYMBOL
                            </div>

                            <div className="chart-heading">
                                ACTIVITY
                            </div>

                            <div>
                                LTP
                            </div>

                            <div>
                                % CHANGE
                            </div>

                            <div>
                                X FACTOR
                            </div>

                            <div>
                                SIGNAL
                            </div>

                            <div>
                                TIME
                            </div>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="trade-flow-error">

                                <span>
                                    {error}
                                </span>

                                <button
                                    onClick={() =>
                                        fetchTradeFlow(
                                            true,
                                            false
                                        )
                                    }
                                >
                                    Retry
                                </button>

                            </div>

                        )}


                        {/* STOCK LIST */}

                        <div className="trade-flow-list">


                            {paginatedStocks.length === 0 ? (

                                <div className="trade-flow-empty">

                                    <div>
                                        🔎
                                    </div>

                                    <h3>
                                        No stocks found
                                    </h3>

                                    <p>
                                        Try another search term.
                                    </p>

                                </div>

                            ) : (

                                paginatedStocks.map(
                                    stock => {

                                        const change =
                                            Number(
                                                stock.changePercent || 0
                                            );


                                        const positive =
                                            change > 0;


                                        const negative =
                                            change < 0;


                                        const xFactor =
                                            getXFactor(
                                                stock.xFactor
                                            );


                                        const activityLevel =
                                            getActivityLevel(
                                                stock.xFactor
                                            );


                                        return (

                                            <div
                                                className="trade-flow-row"
                                                key={
                                                    stock.token ||
                                                    stock.symbol
                                                }
                                            >


                                                {/* SYMBOL */}

                                                <div className="stock-symbol-cell">

                                                    <div className="stock-avatar">

                                                        {
                                                            (
                                                                stock.symbol ||
                                                                "--"
                                                            )
                                                                .substring(
                                                                    0,
                                                                    2
                                                                )
                                                        }

                                                    </div>


                                                    <div className="stock-name-wrapper">

                                                        <strong>

                                                            {
                                                                stock.symbol ||
                                                                "--"
                                                            }

                                                        </strong>


                                                        <small>

                                                            {
                                                                stock.name ||
                                                                stock.tradingSymbol ||
                                                                "--"
                                                            }

                                                        </small>

                                                    </div>

                                                </div>


                                                {/* ACTIVITY */}

                                                <div className="activity-cell">

                                                    <div
                                                        className="activity-bars"
                                                        title={
                                                            xFactor !== null
                                                                ? `Activity: ${xFactor.toFixed(2)}x`
                                                                : "X Factor history not available"
                                                        }
                                                    >

                                                        {/* BAR 1 */}

                                                        <span
                                                            className={
                                                                activityLevel >= 1
                                                                    ? "activity-low"
                                                                    : ""
                                                            }
                                                        />


                                                        {/* BAR 2 */}

                                                        <span
                                                            className={
                                                                activityLevel >= 2
                                                                    ? "activity-medium"
                                                                    : ""
                                                            }
                                                        />


                                                        {/* BAR 3 */}

                                                        <span
                                                            className={
                                                                activityLevel >= 3
                                                                    ? "activity-high"
                                                                    : ""
                                                            }
                                                        />


                                                        {/* BAR 4 */}

                                                        <span
                                                            className={
                                                                activityLevel >= 4
                                                                    ? "activity-high"
                                                                    : ""
                                                            }
                                                        />


                                                        {/* BAR 5 */}

                                                        <span
                                                            className={
                                                                activityLevel >= 5
                                                                    ? "activity-high"
                                                                    : ""
                                                            }
                                                        />

                                                    </div>


                                                    <small>

                                                        {
                                                            formatVolume(
                                                                stock.volume
                                                            )
                                                        }

                                                    </small>

                                                </div>


                                                {/* LTP */}

                                                <div className="ltp">

                                                    ₹

                                                    {Number(
                                                        stock.price || 0
                                                    ).toLocaleString(
                                                        "en-IN",
                                                        {
                                                            minimumFractionDigits:
                                                                2,

                                                            maximumFractionDigits:
                                                                2
                                                        }
                                                    )}

                                                </div>


                                                {/* CHANGE */}

                                                <div>

                                                    <span
                                                        className={
                                                            positive
                                                                ? "change-badge positive"
                                                                : negative
                                                                    ? "change-badge negative"
                                                                    : "change-badge neutral"
                                                        }
                                                    >

                                                        {
                                                            positive
                                                                ? "▲"
                                                                : negative
                                                                    ? "▼"
                                                                    : "●"
                                                        }

                                                        {" "}

                                                        {Math.abs(
                                                            change
                                                        ).toFixed(2)}

                                                        %

                                                    </span>

                                                </div>


                                                {/* X FACTOR */}

                                                <div
                                                    className="x-factor"
                                                    title={
                                                        xFactor !== null
                                                            ? `Volume activity is ${xFactor.toFixed(2)} times the previous interval`
                                                            : "X Factor requires volume history"
                                                    }
                                                >

                                                    <strong>

                                                        {xFactor !== null
                                                            ? `${xFactor.toFixed(2)}x`
                                                            : "N/A"}

                                                    </strong>

                                                </div>


                                                {/* SIGNAL */}

                                                <div>

                                                    <span
                                                        className={
                                                            getSignalClass(
                                                                stock.signal
                                                            )
                                                        }
                                                    >

                                                        {
                                                            stock.signal ||
                                                            "Neutral"
                                                        }

                                                    </span>

                                                </div>


                                                {/* TIME */}

                                                <div className="trade-time">

                                                    {
                                                        formatTime(
                                                            stock.exchangeTime
                                                        )
                                                    }

                                                </div>

                                            </div>

                                        );

                                    }
                                )

                            )}

                        </div>

                    </div>


                    {/* =========================================
                        PAGINATION
                    ========================================= */}

                    {totalPages > 1 && (

                        <div className="trade-flow-pagination">


                            <div className="pagination-info">

                                Showing

                                {" "}

                                <strong>
                                    {startIndex + 1}
                                </strong>

                                {" - "}

                                <strong>

                                    {Math.min(
                                        startIndex +
                                        ITEMS_PER_PAGE,
                                        filteredStocks.length
                                    )}

                                </strong>

                                {" of "}

                                <strong>
                                    {filteredStocks.length}
                                </strong>

                                {" stocks"}

                            </div>


                            <div className="pagination-buttons">


                                <button
                                    disabled={
                                        safePage === 1
                                    }
                                    onClick={() =>
                                        changePage(
                                            safePage - 1
                                        )
                                    }
                                >
                                    ←
                                </button>


                                {Array.from(
                                    {
                                        length:
                                            Math.min(
                                                totalPages,
                                                7
                                            )
                                    },
                                    (_, index) => {

                                        let page =
                                            index + 1;


                                        if (
                                            totalPages > 7 &&
                                            safePage > 4
                                        ) {

                                            page =
                                                safePage -
                                                3 +
                                                index;


                                            if (
                                                page >
                                                totalPages
                                            ) {

                                                page =
                                                    totalPages -
                                                    6 +
                                                    index;

                                            }

                                        }


                                        return (

                                            <button
                                                key={
                                                    page
                                                }
                                                className={
                                                    page ===
                                                    safePage
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    changePage(
                                                        page
                                                    )
                                                }
                                            >

                                                {page}

                                            </button>

                                        );

                                    }
                                )}


                                <button
                                    disabled={
                                        safePage ===
                                        totalPages
                                    }
                                    onClick={() =>
                                        changePage(
                                            safePage + 1
                                        )
                                    }
                                >
                                    →
                                </button>


                            </div>

                        </div>

                    )}

                </div>

            </div>

        </MainLayout>

    );

}


export default TradeFlow;