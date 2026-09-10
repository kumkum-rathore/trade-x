import { useAuth } from "../context/AuthContext";
import TopGainers from "../components/dashboard/TopGainers";
import TopLosers from "../components/dashboard/TopLosers";
import MarketDistribution from "../components/dashboard/MarketDistribution";
import MarketChart from "../components/dashboard/MarketChart";
import MainLayout from "../components/layout/MainLayout";

import MarketOverview from "../components/dashboard/MarketOverview";
import MarketBias from "../components/dashboard/MarketBias";
import PCRCard from "../components/dashboard/PCRCard";
import StockSearch from "../components/dashboard/StockSearch";

function Dashboard() {

    const { user } = useAuth();

    return (
        <MainLayout>

            <div className="dashboard-header">

                <h1>
                    Trading Dashboard
                </h1>

                <p>
                    Welcome back, {user?.name}
                </p>

            </div>

           <MarketOverview />

<StockSearch />

<MarketChart />
            <div className="analysis-grid">

                <MarketBias />

                <PCRCard />

            </div>

            <div className="movers-grid">

                <TopGainers />

                <TopLosers />

            </div>

            <MarketDistribution />

        </MainLayout>
    );
}

export default Dashboard;