import {
    useEffect,
    useMemo,
    useState
} from "react";

import api from "../services/api";

import MainLayout from "../components/layout/MainLayout";

import "./LiveTradeFlow.css";


function LiveTradeFlow() {

    const [type, setType] = useState("all");

    const [stocks, setStocks] = useState([]);

    const [rockers, setRockers] = useState([]);

    const [shockers, setShockers] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [marketStatus, setMarketStatus] = useState(null);

    const [updatedAt, setUpdatedAt] = useState(null);


    // =========================================
    // FETCH LIVE TRADE FLOW
    // =========================================

    const fetchTradeFlow = async () => {

        try {

            setError("");

            const response = await api.get(
                `/market-data/trade-flow?type=${type}`
            );


            const result = response.data?.data;


            // -----------------------------------------
            // ALL STOCKS
            // -----------------------------------------

            setStocks(
                Array.isArray(result?.stocks)
                    ? result.stocks
                    : []
            );


            // -----------------------------------------
            // MARKET ROCKERS
            // Backend calculated
            // -----------------------------------------

            setRockers(
                Array.isArray(result?.rockers)
                    ? result.rockers
                    : []
            );


            // -----------------------------------------
            // MARKET SHOCKERS
            // Backend calculated
            // -----------------------------------------

            setShockers(
                Array.isArray(result?.shockers)
                    ? result.shockers
                    : []
            );


            // -----------------------------------------
            // MARKET STATUS
            // -----------------------------------------

            setMarketStatus(
                result?.marketStatus || null
            );


            // -----------------------------------------
            // UPDATED TIME
            // -----------------------------------------

            setUpdatedAt(
                result?.updatedAt || null
            );


        } catch (err) {

            console.error(
                "LIVE TRADE FLOW ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load live trade flow"
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // INITIAL LOAD + TYPE CHANGE
    // =========================================

    useEffect(() => {

        setLoading(true);

        setSearch("");

        fetchTradeFlow();

    }, [type]);


    // =========================================
    // AUTO REFRESH - 30 SECONDS
    // =========================================

    useEffect(() => {

        const interval = setInterval(() => {

            fetchTradeFlow();

        }, 30000);


        return () => {

            clearInterval(interval);

        };

    }, [type]);


    // =========================================
    // SEARCH HELPER
    // =========================================

    const filterStocks = (items) => {

        const query = search
            .trim()
            .toUpperCase();


        if (!query) {

            return items;

        }


        return items.filter((stock) => {

            const symbol = String(
                stock?.symbol || ""
            ).toUpperCase();


            const name = String(
                stock?.name || ""
            ).toUpperCase();


            const tradingSymbol = String(
                stock?.tradingSymbol || ""
            ).toUpperCase();


            return (
                symbol.includes(query) ||
                name.includes(query) ||
                tradingSymbol.includes(query)
            );

        });

    };


    // =========================================
    // FILTERED ROCKERS
    // =========================================

    const filteredRockers = useMemo(() => {

        return filterStocks(rockers).slice(0, 50);

    }, [rockers, search]);


    // =========================================
    // FILTERED SHOCKERS
    // =========================================

    const filteredShockers = useMemo(() => {

        return filterStocks(shockers).slice(0, 50);

    }, [shockers, search]);


    // =========================================
    // MARKET COUNTS
    // =========================================

    const totalStocks = stocks.length;


    const upCount = stocks.filter(
        (stock) =>
            Number(stock?.changePercent || 0) > 0
    ).length;


    const downCount = stocks.filter(
        (stock) =>
            Number(stock?.changePercent || 0) < 0
    ).length;


    const unchangedCount = stocks.filter(
        (stock) =>
            Number(stock?.changePercent || 0) === 0
    ).length;


    const upPercentage = totalStocks
        ? ((upCount / totalStocks) * 100).toFixed(2)
        : "0.00";


    const downPercentage = totalStocks
        ? ((downCount / totalStocks) * 100).toFixed(2)
        : "0.00";


    const unchangedPercentage = totalStocks
        ? ((unchangedCount / totalStocks) * 100).toFixed(2)
        : "0.00";


    // =========================================
    // HELPERS
    // =========================================

    const formatPrice = (value) => {

        const number = Number(value);


        if (!Number.isFinite(number)) {

            return "—";

        }


        return number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };


    const formatPercent = (value) => {

        const number = Number(value);


        if (!Number.isFinite(number)) {

            return "0.00";

        }


        return Math.abs(number).toFixed(2);

    };


    // =========================================
    // X FACTOR
    // =========================================

    const formatXFactor = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "N/A";

        }


        const number = Number(value);


        if (!Number.isFinite(number)) {

            return "N/A";

        }


        return `${number.toFixed(2)}x`;

    };


    // =========================================
    // TIME
    // =========================================

    const formatTime = (stock) => {

        const time =
            stock?.exchangeTime ||
            stock?.time ||
            stock?.exchFeedTime ||
            stock?.exchTradeTime;


        if (!time) {

            return "—";

        }


        if (
            typeof time === "string" &&
            time.includes(" ")
        ) {

            const parts = time.split(" ");


            return parts[parts.length - 1];

        }


        return time;

    };


    // =========================================
    // UPDATED TIME
    // =========================================

    const formatUpdatedTime = () => {

        if (!updatedAt) {

            return "";

        }


        const date = new Date(updatedAt);


        if (Number.isNaN(date.getTime())) {

            return "";

        }


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    };


    // =========================================
    // SIGNAL CLASS
    // =========================================

    const getSignalClass = (stock) => {

        const signal = String(
            stock?.signal || ""
        ).toUpperCase();


        if (
            signal === "BUY SURGE" ||
            signal === "BREAKOUT" ||
            signal === "MOMENTUM"
        ) {

            return "live-flow-signal-up";

        }


        if (
            signal === "SELL PRESSURE" ||
            signal === "BREAKDOWN" ||
            signal === "WEAKNESS"
        ) {

            return "live-flow-signal-down";

        }


        return "live-flow-signal-neutral";

    };


    // =========================================
    // SIGNAL ICON
    // =========================================

    const getSignalIcon = (stock) => {

        const signal = String(
            stock?.signal || ""
        ).toUpperCase();


        if (
            signal === "BUY SURGE" ||
            signal === "BREAKOUT" ||
            signal === "MOMENTUM"
        ) {

            return "↗";

        }


        if (
            signal === "SELL PRESSURE" ||
            signal === "BREAKDOWN" ||
            signal === "WEAKNESS"
        ) {

            return "↘";

        }


        return "→";

    };


    // =========================================
    // STOCK INITIALS
    // =========================================

    const getInitials = (stock) => {

        const symbol = String(
            stock?.symbol || "ST"
        )
            .replace("-EQ", "")
            .trim();


        return symbol
            .slice(0, 2)
            .toUpperCase();

    };


    // =========================================
    // STOCK ROW
    // =========================================

    const StockRow = ({ stock }) => {

        const changePercent = Number(
            stock?.changePercent || 0
        );


        const positive = changePercent >= 0;


        const buyPressure = Number(
            stock?.buyPressure ?? 50
        );


        const sellPressure = Number(
            stock?.sellPressure ?? 50
        );


        return (

            <div className="live-flow-row">

                {/* SYMBOL */}

                <div className="live-flow-symbol">

                    <div
                        className={
                            positive
                                ? "stock-avatar stock-avatar-green"
                                : "stock-avatar stock-avatar-red"
                        }
                    >

                        {getInitials(stock)}

                    </div>


                    <div className="stock-name-box">

                        <strong>
                            {
                                String(
                                    stock?.symbol || "-"
                                ).replace("-EQ", "")
                            }
                        </strong>


                        <span>
                            {
                                stock?.name ||
                                stock?.tradingSymbol ||
                                String(
                                    stock?.symbol || "-"
                                ).replace("-EQ", "")
                            }
                        </span>

                    </div>

                </div>


                {/* BUY / SELL FLOW */}

                <div className="live-flow-pressure">

                    <div className="pressure-label">

                        <span>
                            B {buyPressure.toFixed(0)}%
                        </span>


                        <span>
                            S {sellPressure.toFixed(0)}%
                        </span>

                    </div>


                    <div className="pressure-bar">

                        <div
                            className="pressure-buy"
                            style={{
                                width: `${buyPressure}%`
                            }}
                        />


                        <div
                            className="pressure-sell"
                            style={{
                                width: `${sellPressure}%`
                            }}
                        />

                    </div>

                </div>


                {/* LTP */}

                <div className="live-flow-price">

                    ₹
                    {formatPrice(
                        stock?.price ??
                        stock?.ltp ??
                        0
                    )}

                </div>


                {/* CHANGE */}

                <div>

                    <span
                        className={
                            positive
                                ? "live-flow-change live-flow-change-up"
                                : "live-flow-change live-flow-change-down"
                        }
                    >

                        {positive ? "▲" : "▼"}

                        {" "}

                        {formatPercent(
                            stock?.changePercent
                        )}

                        %

                    </span>

                </div>


                {/* X FACTOR */}

                <div className="live-flow-xfactor">

                    {formatXFactor(
                        stock?.xFactor
                    )}

                </div>


                {/* SIGNAL */}

                <div className="signal-box">

                    <span
                        className={
                            `live-flow-signal-icon ${
                                getSignalClass(stock)
                            }`
                        }
                    >

                        {getSignalIcon(stock)}

                    </span>


                    <span
                        className={
                            `signal-text ${
                                getSignalClass(stock)
                            }`
                        }
                    >

                        {
                            stock?.signal ||
                            "NEUTRAL"
                        }

                    </span>

                </div>


                {/* TIME */}

                <div className="live-flow-time">

                    {formatTime(stock)}

                </div>

            </div>

        );

    };


    // =========================================
    // FLOW SECTION
    // =========================================

    const FlowSection = ({
        title,
        items
    }) => {

        return (

            <section className="live-flow-card">

                {/* HEADER */}

                <div className="live-flow-card-header">

                    <div className="live-flow-title">

                        <h2>
                            {title}
                        </h2>


                        <span className="live-badge">
                            LIVE
                        </span>

                    </div>


                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="live-flow-search"
                    />

                </div>


                {/* MARKET DISTRIBUTION */}

                <div className="live-flow-progress">

                    <div
                        className="progress-up"
                        style={{
                            width: `${upPercentage}%`
                        }}
                    />


                    <div
                        className="progress-down"
                        style={{
                            width: `${downPercentage}%`
                        }}
                    />

                </div>


                {/* COUNTS */}

                <div className="live-flow-counts">

                    <span className="count-up">

                        <b>●</b>

                        {" "}

                        {upCount}

                        {" stocks ("}

                        {upPercentage}

                        {"% Up)"}

                    </span>


                    <span className="count-down">

                        <b>●</b>

                        {" "}

                        {downCount}

                        {" stocks ("}

                        {downPercentage}

                        {"% Down)"}

                    </span>

                </div>


                {/* TABLE HEADER */}

                <div className="live-flow-table-header">

                    <div>
                        SYMBOL ↕
                    </div>


                    <div>
                        FLOW
                    </div>


                    <div>
                        LTP ↕
                    </div>


                    <div>
                        % CHANGE ↕
                    </div>


                    <div>
                        X FACTOR ↕
                    </div>


                    <div>
                        SIGNAL ↕
                    </div>


                    <div>
                        TIME ↕
                    </div>

                </div>


                {/* STOCK LIST */}

                <div className="live-flow-list">

                    {items.length === 0 ? (

                        <div className="live-flow-empty">

                            No stocks found

                        </div>

                    ) : (

                        items.map((stock) => (

                            <StockRow
                                key={
                                    `${title}-${stock.token || stock.symbol}`
                                }
                                stock={stock}
                            />

                        ))

                    )}

                </div>

            </section>

        );

    };


    // =========================================
    // LOADING
    // =========================================

    if (
        loading &&
        stocks.length === 0
    ) {

        return (

            <MainLayout>

                <div className="live-trade-flow-page">

                    <div className="live-flow-loading">

                        Loading live market data...

                    </div>

                </div>

            </MainLayout>

        );

    }


    // =========================================
    // ERROR
    // =========================================

    if (
        error &&
        stocks.length === 0
    ) {

        return (

            <MainLayout>

                <div className="live-trade-flow-page">

                    <div className="live-flow-error">

                        {error}

                    </div>

                </div>

            </MainLayout>

        );

    }


    // =========================================
    // PAGE
    // =========================================

    return (

        <MainLayout>

            <div className="live-trade-flow-page">

                {/* TOP TABS */}

                <div className="live-flow-tabs">

                    <button
                        className={
                            type === "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setType("all")
                        }
                    >
                        All Stocks
                    </button>


                    <button
                        className={
                            type === "fno"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setType("fno")
                        }
                    >
                        F&O
                    </button>

                </div>


                {/* MARKET STATUS */}

                <div className="live-flow-status">

                    <span
                        className={
                            marketStatus?.isOpen
                                ? "status-dot status-open"
                                : "status-dot status-closed"
                        }
                    />


                    <strong>

                        {
                            marketStatus?.isOpen
                                ? "MARKET OPEN"
                                : "MARKET CLOSED"
                        }

                    </strong>


                    {formatUpdatedTime() && (

                        <span className="live-flow-updated">

                            Updated {formatUpdatedTime()}

                        </span>

                    )}

                </div>


                {/* ERROR DURING REFRESH */}

                {error && stocks.length > 0 && (

                    <div className="live-flow-refresh-error">

                        {error}

                    </div>

                )}


                {/* MARKET ROCKERS */}

                <FlowSection
                    title="MARKET ROCKERS"
                    items={filteredRockers}
                />


                {/* MARKET SHOCKERS */}

                <FlowSection
                    title="MARKET SHOCKERS"
                    items={filteredShockers}
                />

            </div>

        </MainLayout>

    );

}


export default LiveTradeFlow;