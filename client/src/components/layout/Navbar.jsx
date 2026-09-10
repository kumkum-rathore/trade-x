import { useAuth } from "../../context/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="navbar">

            <div className="navbar-logo">
                TradeX
            </div>

            <div className="navbar-search">
                <input
                    type="text"
                    placeholder="Search stocks..."
                />
            </div>

            <div className="navbar-user">

                <span>
                    {user?.name}
                </span>

                <button onClick={logout}>
                    Logout
                </button>

            </div>

        </header>
    );
}

export default Navbar;