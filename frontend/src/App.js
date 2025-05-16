// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import GDP from "./components/GDP"; 
import CreditCardUsage from "./components/CreditCardUsage";
import MobileOnlinePurchases from "./components/MobileOnlinePurchases";
import InternetBanking from "./components/InternetBanking";
import Inflation from "./components/Inflation";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gdp" element={<GDP />} />
            <Route path="/credit-card" element={<CreditCardUsage />} />
            <Route path="/online-purchases" element={<MobileOnlinePurchases />} />
            <Route path="/internet-banking" element={<InternetBanking />} />
            <Route path="/inflation" element={<Inflation />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
