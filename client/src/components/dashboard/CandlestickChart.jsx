import { useEffect, useRef } from "react";
import {
    createChart,
    CandlestickSeries
} from "lightweight-charts";


function CandlestickChart({ data = [] }) {

    const chartContainerRef =
        useRef(null);


    useEffect(() => {

        if (
            !chartContainerRef.current ||
            !Array.isArray(data) ||
            data.length === 0
        ) {
            console.log(
                "No candle data available:",
                data
            );

            return;
        }


        // =====================================
        // CREATE CHART
        // =====================================

        const chart =
            createChart(
                chartContainerRef.current,
                {

                    width:
                        chartContainerRef.current
                            .clientWidth,

                    height: 400,

                    layout: {
                        textColor: "#cccccc",

                        background: {
                            color: "#111820"
                        }
                    },

                    grid: {

                        vertLines: {
                            color: "#1e2935"
                        },

                        horzLines: {
                            color: "#1e2935"
                        }

                    },

                    rightPriceScale: {
                        borderColor: "#334155"
                    },

                    timeScale: {

                        borderColor: "#334155",

                        timeVisible: true,

                        secondsVisible: false

                    }

                }
            );


        // =====================================
        // CANDLESTICK SERIES
        // =====================================

        const candleSeries =
            chart.addSeries(
                CandlestickSeries,
                {

                    upColor: "#22c55e",

                    downColor: "#ef4444",

                    borderUpColor:
                        "#22c55e",

                    borderDownColor:
                        "#ef4444",

                    wickUpColor:
                        "#22c55e",

                    wickDownColor:
                        "#ef4444"

                }
            );


        // =====================================
        // CONVERT API DATA
        // =====================================

        const chartData = data
            .map((item) => {

                if (
                    !item ||
                    !item.time
                ) {
                    return null;
                }


                const open =
                    Number(item.open);

                const high =
                    Number(item.high);

                const low =
                    Number(item.low);

                const close =
                    Number(item.close);


                if (
                    !Number.isFinite(open) ||
                    !Number.isFinite(high) ||
                    !Number.isFinite(low) ||
                    !Number.isFinite(close)
                ) {
                    return null;
                }


                const date =
                    new Date(item.time);


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {
                    return null;
                }


                return {

                    time:
                        Math.floor(
                            date.getTime() / 1000
                        ),

                    open,

                    high,

                    low,

                    close

                };

            })
            .filter(
                item => item !== null
            );


        // =====================================
        // SORT BY TIME
        // =====================================

        chartData.sort(
            (a, b) =>
                a.time - b.time
        );


        console.log(
            "CANDLE CHART DATA:",
            chartData
        );


        // =====================================
        // SET CANDLE DATA
        // =====================================

        if (
            chartData.length > 0
        ) {

            candleSeries.setData(
                chartData
            );

            chart.timeScale()
                .fitContent();

        }


        // =====================================
        // RESPONSIVE
        // =====================================

        const handleResize = () => {

            if (
                chartContainerRef.current
            ) {

                chart.applyOptions({

                    width:
                        chartContainerRef
                            .current
                            .clientWidth

                });

            }

        };


        window.addEventListener(
            "resize",
            handleResize
        );


        // =====================================
        // CLEANUP
        // =====================================

        return () => {

            window.removeEventListener(
                "resize",
                handleResize
            );

            chart.remove();

        };


    }, [data]);


    return (

        <div
            ref={chartContainerRef}
            className="candlestick-chart"

            style={{
                width: "100%",
                height: "400px"
            }}
        />

    );

}


export default CandlestickChart;