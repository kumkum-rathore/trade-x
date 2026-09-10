import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function OptionChain() {

    const [symbol, setSymbol] =
        useState("NIFTY");

    const [optionData, setOptionData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchOptions = async (
        selectedSymbol = symbol
    ) => {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    `/options?symbol=${selectedSymbol}`
                );


            setOptionData(
                response.data.data
            );


        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load option chain"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchOptions("NIFTY");

    }, []);


    const handleSymbolChange = (
        selectedSymbol
    ) => {

        setSymbol(selectedSymbol);

        fetchOptions(
            selectedSymbol
        );

    };


    return (

        <MainLayout>

            <div className="option-page">

                <div className="page-header">

                    <h1>
                        Option Chain
                    </h1>

                    <p>
                        Analyze Call and Put
                        option activity
                    </p>

                </div>


                {/* CONTROLS */}

                <div className="option-controls">

                    <div className="option-index-buttons">

                        <button
                            className={
                                symbol === "NIFTY"
                                    ? "option-index-active"
                                    : ""
                            }
                            onClick={() =>
                                handleSymbolChange(
                                    "NIFTY"
                                )
                            }
                        >
                            NIFTY
                        </button>


                        <button
                            className={
                                symbol === "SENSEX"
                                    ? "option-index-active"
                                    : ""
                            }
                            onClick={() =>
                                handleSymbolChange(
                                    "SENSEX"
                                )
                            }
                        >
                            SENSEX
                        </button>

                    </div>

                </div>


                {loading && (

                    <div className="option-message">

                        Loading option chain...

                    </div>

                )}


                {error && (

                    <div className="option-error">

                        {error}

                    </div>

                )}


                {!loading &&
                    !error &&
                    optionData && (

                    <>

                        {/* SUMMARY */}

                        <div className="option-summary">

                            <div>

                                <span>
                                    Index
                                </span>

                                <strong>
                                    {optionData.symbol}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Spot Price
                                </span>

                                <strong>
                                    {optionData.spotPrice.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Expiry
                                </span>

                                <strong>
                                    {optionData.expiry}
                                </strong>

                            </div>

                        </div>




{/* OI ANALYTICS */}

<div className="option-analytics">

    <div className="option-analytics-card">

        <span>
            PCR
        </span>

        <strong>
            {optionData.analytics.pcr}
        </strong>

    </div>


    <div className="option-analytics-card">

        <span>
            Total Call OI
        </span>

        <strong>
            {optionData.analytics.totalCallOI.toLocaleString(
                "en-IN"
            )}
        </strong>

    </div>


    <div className="option-analytics-card">

        <span>
            Total Put OI
        </span>

        <strong>
            {optionData.analytics.totalPutOI.toLocaleString(
                "en-IN"
            )}
        </strong>

    </div>


    <div className="option-analytics-card">

        <span>
            Highest Call OI
        </span>

        <strong>
            {optionData.analytics.maxCallOI.strikePrice}
        </strong>

        <small>
            OI:{" "}
            {optionData.analytics.maxCallOI.oi.toLocaleString(
                "en-IN"
            )}
        </small>

    </div>


    <div className="option-analytics-card">

        <span>
            Highest Put OI
        </span>

        <strong>
            {optionData.analytics.maxPutOI.strikePrice}
        </strong>

        <small>
            OI:{" "}
            {optionData.analytics.maxPutOI.oi.toLocaleString(
                "en-IN"
            )}
        </small>

    </div>

</div>


<div className="oi-distribution">

    <div className="oi-distribution-header">

        <h2>
            OI Distribution
        </h2>

    </div>


    <div className="oi-distribution-item">

        <div className="oi-distribution-label">

            <span>
                Call OI
            </span>

            <strong>
                {optionData.analytics.callOIPercent}%
            </strong>

        </div>


        <div className="oi-distribution-bar">

            <div
                className="call-oi-bar"
                style={{
                    width:
                        `${optionData.analytics.callOIPercent}%`
                }}
            />

        </div>

    </div>


    <div className="oi-distribution-item">

        <div className="oi-distribution-label">

            <span>
                Put OI
            </span>

            <strong>
                {optionData.analytics.putOIPercent}%
            </strong>

        </div>


        <div className="oi-distribution-bar">

            <div
                className="put-oi-bar"
                style={{
                    width:
                        `${optionData.analytics.putOIPercent}%`
                }}
            />

        </div>

    </div>

</div>


                        {/* OPTION TABLE */}

                        <div className="option-table-wrapper">

                            <table className="option-table">

                                <thead>

                                    <tr>

                                        <th
                                            colSpan="4"
                                            className="call-heading"
                                        >
                                            CALL OPTIONS
                                        </th>


                                        <th
                                            rowSpan="2"
                                            className="strike-heading"
                                        >
                                            STRIKE
                                        </th>


                                        <th
                                            colSpan="4"
                                            className="put-heading"
                                        >
                                            PUT OPTIONS
                                        </th>

                                    </tr>


                                    <tr>

                                        <th>
                                            OI
                                        </th>

                                        <th>
                                            Volume
                                        </th>

                                        <th>
                                            LTP
                                        </th>

                                        <th>
                                            Change
                                        </th>


                                        <th>
                                            OI
                                        </th>

                                        <th>
                                            Volume
                                        </th>

                                        <th>
                                            LTP
                                        </th>

                                        <th>
                                            Change
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {optionData.rows.map(
                                        (row) => {

                                            return (

                                                <tr
                                                    key={
                                                        row.strikePrice
                                                    }
                                                >

                                                    <td>
                                                        {row.call.oi.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td>
                                                        {row.call.volume.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td>
                                                        {row.call.ltp}
                                                    </td>

                                                    <td
                                                        className={
                                                            row.call.change >= 0
                                                                ? "option-positive"
                                                                : "option-negative"
                                                        }
                                                    >

                                                        {row.call.change >= 0
                                                            ? "+"
                                                            : ""}

                                                        {row.call.change}

                                                    </td>


                                                    <td className="strike-price">

                                                        {row.strikePrice.toLocaleString(
                                                            "en-IN"
                                                        )}

                                                    </td>


                                                    <td>
                                                        {row.put.oi.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td>
                                                        {row.put.volume.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td>
                                                        {row.put.ltp}
                                                    </td>

                                                    <td
                                                        className={
                                                            row.put.change >= 0
                                                                ? "option-positive"
                                                                : "option-negative"
                                                        }
                                                    >

                                                        {row.put.change >= 0
                                                            ? "+"
                                                            : ""}

                                                        {row.put.change}

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </>

                )}

            </div>

        </MainLayout>

    );

}


export default OptionChain;