import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function OptionClock() {

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchClock = async () => {

        try {

            const response =
                await api.get(
                    "/option-clock"
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
                "Failed to load option clock"
            );

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchClock();


        const interval =
            setInterval(
                fetchClock,
                1000
            );


        return () =>
            clearInterval(
                interval
            );

    }, []);


    if (loading) {

        return (

            <MainLayout>

                <div className="option-clock-page">

                    Loading option clock...

                </div>

            </MainLayout>

        );

    }


    if (error) {

        return (

            <MainLayout>

                <div className="option-clock-page">

                    <div className="option-clock-error">

                        {error}

                    </div>

                </div>

            </MainLayout>

        );

    }


    return (

        <MainLayout>

            <div className="option-clock-page">

                <div className="page-header">

                    <h1>
                        Option Clock
                    </h1>

                    <p>
                        NIFTY 50 option market overview
                    </p>

                </div>


                {/* CLOCK */}

                <div className="clock-main-card">

                    <div className="clock-index">

                        <span>
                            Index
                        </span>

                        <h2>
                            {data.index}
                        </h2>

                    </div>


                    <div className="clock-status">

                        <span>
                            Market Status
                        </span>

                        <strong
                            className={
                                data.marketStatus === "OPEN"
                                    ? "clock-open"
                                    : data.marketStatus === "PRE-OPEN"
                                        ? "clock-preopen"
                                        : "clock-closed"
                            }
                        >

                            {data.marketStatus}

                        </strong>

                    </div>


                    <div className="clock-time">

                        <span>
                            Current Time
                        </span>

                        <strong>
                            {data.marketTime}
                        </strong>

                    </div>


                    <div className="clock-countdown">

                        <span>
                            Time Remaining
                        </span>

                        <strong>

                            {String(
                                data.remaining.hours
                            ).padStart(2, "0")}

                            :

                            {String(
                                data.remaining.minutes
                            ).padStart(2, "0")}

                            :

                            {String(
                                data.remaining.seconds
                            ).padStart(2, "0")}

                        </strong>

                    </div>

                </div>


                {/* OPTION DATA */}

                <div className="clock-data-grid">

                    <div className="clock-data-card">

                        <span>
                            ATM Strike
                        </span>

                        <strong>
                            {data.atmStrike.toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                    </div>


                    <div className="clock-data-card">

                        <span>
                            Call OI
                        </span>

                        <strong>

                            {(
                                data.callOI /
                                10000000
                            ).toFixed(2)}

                            Cr

                        </strong>

                    </div>


                    <div className="clock-data-card">

                        <span>
                            Put OI
                        </span>

                        <strong>

                            {(
                                data.putOI /
                                10000000
                            ).toFixed(2)}

                            Cr

                        </strong>

                    </div>


                    <div className="clock-data-card">

                        <span>
                            PCR
                        </span>

                        <strong>
                            {data.pcr}
                        </strong>

                    </div>

                </div>


                {/* BIAS */}

                <div className="clock-bias-card">

                    <span>
                        Market Bias
                    </span>

                    <strong
                        className={
                            data.marketBias === "Bullish"
                                ? "clock-open"
                                : data.marketBias === "Bearish"
                                    ? "clock-closed"
                                    : "clock-neutral"
                        }
                    >

                        {data.marketBias}

                    </strong>

                </div>

            </div>

        </MainLayout>

    );

}


export default OptionClock;