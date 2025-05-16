import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./GdpChart.css";

const GdpChart = () => {
  const [gdpData, setGdpData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGdpData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/gdp");
        const rawData = response.data.value;

        const formatted = rawData
          .filter(item => item.OBS_VALUE && item.TIME_PERIOD)
          .map(item => ({
            year: item.TIME_PERIOD,
            gdp: parseFloat(item.OBS_VALUE),
          }))
          .sort((a, b) => parseInt(a.year) - parseInt(b.year));

        setGdpData(formatted);
      } catch (error) {
        console.error("Failed to fetch GDP data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGdpData();
  }, []);

  if (loading) {
    return <div className="gdp-loading">Loading chart...</div>;
  }

  return (
    <div className="gdp-chart-container">
      <h2 className="gdp-title">Malaysia's GDP Per Capita </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={gdpData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${value}`, "GDP Per Capita (current US$)"]} />
          <Legend />
          <Bar dataKey="gdp" fill="#8884d8" name="GDP Per Capita" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GdpChart;
