import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Watchlist from "./pages/Watchlist";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Portfolio from "./pages/Portfolio";
import StockDetail from "./pages/StockDetail";
import News
    from "./pages/News";
import MarketOverview
    from "./pages/MarketOverview";
    import SectorAnalysis
    from "./pages/SectorAnalysis";
    import MarketAnalysis
    from "./pages/MarketAnalysis";
    import OptionChain
    from "./pages/OptionChain";
    import TradingSignals
    from "./pages/TradingSignals";
    import TradeFlow
    from "./pages/TradeFlow";
    import IndexMover
    from "./pages/IndexMover";
    import TradeBrahmand
    from "./pages/TradeBrahmand";
    import TradeAI
    from "./pages/TradeAI";
    import OptionClock
    from "./pages/OptionClock";
function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
    path="/watchlist"
    element={
        <ProtectedRoute>
            <Watchlist />
        </ProtectedRoute>
    }
/>

<Route
    path="/profile"
    element={
        <ProtectedRoute>
            <Profile />
        </ProtectedRoute>
    }
/>
<Route
    path="/portfolio"
    element={
        <ProtectedRoute>
            <Portfolio />
        </ProtectedRoute>
    }
/>

<Route
    path="/stock/:symbol"
    element={
        <ProtectedRoute>
            <StockDetail />
        </ProtectedRoute>
    }
/>

<Route
    path="/news"
    element={
        <ProtectedRoute>
            <News />
        </ProtectedRoute>
    }
/>

<Route
    path="/market-overview"
    element={
        <ProtectedRoute>
            <MarketOverview />
        </ProtectedRoute>
    }
/>

<Route
    path="/sectors"
    element={
        <ProtectedRoute>
            <SectorAnalysis />
        </ProtectedRoute>
    }
/>

<Route
    path="/analysis"
    element={
        <ProtectedRoute>
            <MarketAnalysis />
        </ProtectedRoute>
    }
/>

<Route
    path="/options"
    element={
        <ProtectedRoute>
            <OptionChain />
        </ProtectedRoute>
    }
/>

<Route
    path="/signals"
    element={
        <ProtectedRoute>
            <TradingSignals />
        </ProtectedRoute>
    }
/>

<Route
    path="/trade-flow"
    element={
        <ProtectedRoute>
            <TradeFlow />
        </ProtectedRoute>
    }
/>
<Route
    path="/index-mover"
    element={
        <ProtectedRoute>
            <IndexMover />
        </ProtectedRoute>
    }
/>
<Route
    path="/trade-brahmand"
    element={
        <ProtectedRoute>
            <TradeBrahmand />
        </ProtectedRoute>
    }
/>
<Route
    path="/trade-ai"
    element={
        <ProtectedRoute>
            <TradeAI />
        </ProtectedRoute>
    }
/>

<Route
    path="/option-clock"
    element={
        <ProtectedRoute>
            <OptionClock />
        </ProtectedRoute>
    }
/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;