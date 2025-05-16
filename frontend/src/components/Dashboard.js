// components/Dashboard.js
import React, { useEffect, useState } from "react";
import Card from "./Card";
import GdpChart from "./GdpChart";
import axios from "axios";
import "./Dashboard.css";


export default function Dashboard() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      const endpoints = {
        gdp: "/api/gdp",
        credit: "/api/credit-card",
        merchant: "/api/online-merchant",
        internetBanking: "/api/internet-banking",
      };

      const baseURL = "http://localhost:4000";

      const results = await Promise.all(
        Object.entries(endpoints).map(async ([key, endpoint]) => {
          try {
            const { data } = await axios.get(baseURL + endpoint);

            let rawValues = data?.value || [];

            // Filter for Internet Banking to only take "TRANSACT" unit
            if (key === "internetBanking") {
              rawValues = rawValues.filter(item => item.UNIT_MEASURE === "TRANSACT");
            }

            const values = rawValues
              .map(item => parseFloat(item.OBS_VALUE))
              .filter(v => !isNaN(v));

            const average = values.length > 0
              ? values.reduce((sum, val) => sum + val, 0) / values.length
              : 0;

            if (key === "credit" || key === "internetBanking") {
              return [key, Math.round(average)];
            } else {
              return [key, average.toFixed(2)];
            }
          } catch (error) {
            console.error(`Failed to fetch or process data for ${key}:`, error.message);
            return [key, 0];
          }
        })
      );

      setMetrics(Object.fromEntries(results));
    };

    fetchAll();
  }, []);

  return (
    <div className="dashboard">
      <h1>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/66/Flag_of_Malaysia.svg"
          alt="Malaysia Flag"
          style={{ width: "40px", marginRight: "10px", verticalAlign: "middle" }}
        />
        Malaysia Economic Dashboard
      </h1>
      <div className="card-grid">
        <Card
          title="GDP per Capita"
          value={`$${metrics.gdp}`}
          description="Average GDP per capita (USD)"
          color="blue"
        />
        <Card
          title="Credit Card Usage"
          value={`${metrics.credit}`}
          description="Average of credit card accounts"
          color="green"
        />
        <Card
          title="Mobile Online Purchases"
          value={`${metrics.merchant}%`}
          description="Average people using mobile/internet for purchases"
          color="purple"
        />
        <Card
          title="Internet Banking"
          value={`${metrics.internetBanking}`}
          description="Average transactions of Mobile/Internet banking access"
          color="red"
        />
      </div>

      <GdpChart />

      {/* 🔍 Explanation Section */}
      <div className="dashboard-explanation">
        <h2>📊 Insights & Interpretation</h2>
        <ul>
          <li><strong>GDP per Capita:</strong> Represents the average economic output per person. A higher value suggests a more developed or wealthier economy.</li>
          <li><strong>Credit Card Usage:</strong> Indicates how widely credit cards are used among the population. This can reflect financial accessibility and consumer behavior.</li>
          <li><strong>Mobile Online Purchases:</strong> Shows the percentage of individuals making purchases using mobile/internet platforms, highlighting digital commerce adoption.</li>
          <li><strong>Internet Banking:</strong> Reflects the average number of online/mobile banking transactions, indicating the popularity and accessibility of digital financial services.</li>
        </ul>
      </div>
    </div>
  );
}
