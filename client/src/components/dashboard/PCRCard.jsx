import {
    useEffect,
    useState
} from "react";

import api from "../../services/api";


function PCRCard() {

    const [pcr, setPcr] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchPCR = async () => {

        try {

            setLoading(true);
            setError("");


            const response =
                await api.get(
                    "/market-data/pcr"
                );


            console.log(
                "CENTRAL PCR DATA:",
                response.data
            );


            setPcr(
                response.data.data
            );


        } 
       catch (error) {

    console.log("PCR FULL ERROR:", error);

    console.log(
        "PCR ERROR RESPONSE:",
        error.response?.data
    );

    console.log(
        "PCR ERROR STATUS:",
        error.response?.status
    );

    console.log(
        "PCR ERROR URL:",
        error.config?.url
    );

    console.log(
        "PCR ERROR BASE URL:",
        error.config?.baseURL
    );

    setError(
        error.response?.data?.message ||
        "Failed to load PCR"
    );

}
        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchPCR();

    }, []);


    if (loading) {

        return (

            <div className="analysis-card">

                <h3>
                    Put Call Ratio (PCR)
                </h3>

                <div className="pcr-value">
                    Loading...
                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="analysis-card">

                <h3>
                    Put Call Ratio (PCR)
                </h3>

                <div className="pcr-value">
                    {error}
                </div>

            </div>

        );

    }


    return (

        <div className="analysis-card">

            <h3>
                Put Call Ratio (PCR)
            </h3>


            <div className="pcr-value">

                {pcr?.value}

            </div>


            <p>

                Current PCR

            </p>


            <p>

                Sentiment:
                {" "}
                {pcr?.sentiment}

            </p>

        </div>

    );

}


export default PCRCard;