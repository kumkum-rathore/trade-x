import { NavLink } from "react-router-dom";

function Sidebar() {

   const menuItems = [
    {
        name: "Dashboard",
        path: "/dashboard"
    },
    {
        name: "Markets",
        path: "/market-overview"
    },
    {
        name: "Options",
        path: "/options"
    },
    {
        name: "Analysis",
        path: "/analysis"
        
    },
    {
        name: "sectors",
        path: "/sectors"
        
    },
   
    {
        name: "Watchlist",
        path: "/watchlist"
    },
    {
        name: "Portfolio",
        path: "/portfolio"
    },
    {
    name: "Signals",
    path: "/signals"
},
{
    name: "Trade Flow",
    path: "/trade-flow"
},
{
    name: "Trade AI",
    path: "/trade-ai"
},
{
    name: "Option Clock",
    path: "/option-clock"
},
{
    name: "Index Mover",
    path: "/index-mover"
},
    {
        name: "News",
        path: "/news"
    },
    {
        name: "Profile",
        path: "/profile"
    },
    {
    name: "Trade Brahmand",
    path: "/trade-brahmand"
},
];

    return (
        <aside className="sidebar">

            <div className="sidebar-menu">

                {menuItems.map((item) => (

                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="sidebar-link"
                    >
                        {item.name}
                    </NavLink>

                ))}

            </div>

        </aside>
    );
}

export default Sidebar;