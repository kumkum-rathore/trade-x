require("dotenv").config();

const express=require("express");
const cors=require("cors");
const PORT=process.env.PORT || 5000;
const connectDB=require("./config/db");
const angelOneRoutes = require("./routes/angelOneRoutes");

const stockStatsRoutes =
require("./routes/stockStatsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const portfolioRoutes =
    require("./routes/portfolioRoutes");
const marketRoutes =
    require("./routes/marketRoutes");
   
const newsRoutes =
    require("./routes/newsRoutes");

    const marketOverviewRoutes =
    require(
        "./routes/marketOverviewRoutes"
    );

    const sectorRoutes =
    require(
        "./routes/sectorRoutes"
    );
    const marketAnalysisRoutes =
    require(
        "./routes/marketAnalysisRoutes"
    );
    const optionRoutes =
    require(
        "./routes/optionRoutes"
    );
    const signalRoutes =
    require(
        "./routes/signalRoutes"
    );

   const tradeFlowRoutes =
    require("./routes/tradeFlowRoutes");



    const indexMoverRoutes =
    require(
        "./routes/indexMoverRoutes"
    );
    const tradeBrahmandRoutes =
    require(
        "./routes/tradeBrahmandRoutes"
    );
    const tradeAIRoutes =
    require(
        "./routes/tradeAIRoutes"
    );
    const optionClockRoutes =
    require(
        "./routes/optionClockRoutes"
    );
    const marketDataRoutes =
    require(
        "./routes/marketDataRoutes"
    );

  

    const breadthRoutes = require("./routes/breadthRoutes");


const app=express();
app.use(cors());
app.use(express.json());
 app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/profile", profileRoutes);
app.use(
    "/api/portfolio",
    portfolioRoutes
);
app.use(
    "/api/market",
    marketRoutes
);

app.use(
    "/api/stats",
    stockStatsRoutes
);
app.use(
    "/api/news",
    newsRoutes
);

app.use(
    "/api/market-overview",
    marketOverviewRoutes
);
app.use(
    "/api/sectors",
    sectorRoutes
);
app.use(
    "/api/analysis",
    marketAnalysisRoutes
);

app.use(
    "/api/options",
    optionRoutes
);

app.use(
    "/api/signals",
    signalRoutes
);

app.use(
    "/api/market-data/trade-flow",
    tradeFlowRoutes
);
app.use(
    "/api/index-movers",
    indexMoverRoutes
);

app.use(
    "/api/trade-brahmand",
    tradeBrahmandRoutes
);
app.use(
    "/api/trade-ai",
    tradeAIRoutes
);
app.use(
    "/api/option-clock",
    optionClockRoutes
);
app.use(
    "/api/market-data",
    marketDataRoutes
);
app.use(
    "/api/market-data",
    breadthRoutes
);
app.use(
    "/api/angel",
    angelOneRoutes
);
 
app.get("/",(req,res)=>{
    res.json({
        message:"trade platform  API is running"
    });

});




const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();
