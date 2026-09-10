function MarketCard({
    name,
    value,
    change,
    changePercent
}) {

    const isPositive = change >= 0;

    return (
        <div className="market-card">

            <h3>{name}</h3>

            <h2>
                {value}
            </h2>

            <p
                className={
                    isPositive
                        ? "positive"
                        : "negative"
                }
            >
                {isPositive ? "+" : ""}
                {change} ({isPositive ? "+" : ""}
                {changePercent}%)
            </p>

        </div>
    );
}

export default MarketCard;