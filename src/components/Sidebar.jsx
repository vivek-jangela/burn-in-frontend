import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        <h2>Burn-In AI</h2>
        <p>Screening System</p>
      </div>

      <nav>

        <NavLink to="/">
          Dashboard
        </NavLink>

        <NavLink to="/components">
          Components
        </NavLink>

        <NavLink to="/lot-analysis">
          Lot Analysis
        </NavLink>

        <NavLink to="/prediction">
          Prediction
        </NavLink>

        <NavLink to="/data-upload">
          Data Upload
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;