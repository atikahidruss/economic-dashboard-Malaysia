// components/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">Malaysia Economic Dashboard</h2>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end activeClassName="active">
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/gdp" activeClassName="active">
            GDP Per Capita
          </NavLink>
        </li>
        <li>
          <NavLink to="/credit-card" activeClassName="active">
            Credit Card Usage
          </NavLink>
        </li>
        <li>
          <NavLink to="/internet-banking" activeClassName="active">
            Internet Banking
          </NavLink>
        </li>
        <li>
          <NavLink to="/inflation" activeClassName="active">
            Inflation
          </NavLink>
        </li>
        <li>
          <NavLink to="/online-purchases" activeClassName="active">
            Mobile Online Purchases
          </NavLink>
        </li>
        <li>
          <NavLink to="/documentation" activeClassName="active">
            Documentation
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
