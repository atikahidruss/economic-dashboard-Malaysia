import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./GDP.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function GDP() {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);
  const [yearRange, setYearRange] = useState("all");
  const [combined, setCombined] = useState(false);

  // Fetch GDP data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/gdp");
        setData(response.data.value || []);
      } catch (error) {
        console.error("Error fetching GDP data:", error);
      }
    };
    fetchData();
  }, []);

  // Extract years and GDP values, sorted by year ascending
  const processedData = data
    .map((d) => ({
      year: Number(d.TIME_PERIOD),
      gdp: Number(d.OBS_VALUE),
    }))
    .sort((a, b) => a.year - b.year);

  // Calculate GDP growth rates between consecutive years
  const growthRates = [];
  for (let i = 1; i < processedData.length; i++) {
    const prev = processedData[i - 1].gdp;
    const curr = processedData[i].gdp;
    const growth = ((curr - prev) / prev) * 100;
    growthRates.push({ year: processedData[i].year, growth: growth.toFixed(2) });
  }

  // Filter data by yearRange dropdown
  let filteredGDP = processedData;
  let filteredGrowth = growthRates;

  if (yearRange !== "all") {
    const [start, end] = yearRange.split("-").map(Number);
    filteredGDP = processedData.filter((d) => d.year >= start && d.year <= end);
    filteredGrowth = growthRates.filter((d) => d.year >= start && d.year <= end);
  }

  // Prepare datasets for chart.js
  const labels = filteredGDP.map((d) => d.year.toString());

  const datasets = [
    {
      label: "GDP per Capita (USD)",
      data: filteredGDP.map((d) => d.gdp),
      borderColor: "rgba(108, 99, 255, 1)",
      backgroundColor: "rgba(108, 99, 255, 0.2)",
      yAxisID: "y1",
      tension: 0.3,
    },
  ];

  if (combined) {
    datasets.push({
      label: "GDP Growth Rate (%)",
      data: filteredGrowth.map((d) => d.growth),
      borderColor: "rgba(255, 99, 132, 1)",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      yAxisID: "y2",
      tension: 0.3,
    });
  }

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    scales: {
      y1: {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "GDP per Capita (USD)",
        },
        ticks: {
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
          maxTicksLimit: 7,
        },
      },
      y2: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Growth Rate (%)",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value) {
            return value + "%";
          },
          maxTicksLimit: 7,
        },
        min: Math.min(...filteredGrowth.map((d) => Number(d.growth))) - 1,
        max: Math.max(...filteredGrowth.map((d) => Number(d.growth))) + 1,
      },
      x: {
        title: {
          display: true,
          text: "Year",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "GDP Growth Rate (%)") {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            }
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
  };

  // Export chart as PNG
  const exportChart = () => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const url = chart.toBase64Image();
    const link = document.createElement("a");
    link.href = url;
    link.download = "gdp-chart.png";
    link.click();
  };

  return (
    <div className="gdp-container">
      <h2>GDP per Capita and Growth Rate Analysis (Malaysia)</h2>

      <div className="controls">
        <label>
          Select Year Range:{" "}
          <select value={yearRange} onChange={(e) => setYearRange(e.target.value)}>
            <option value="all">All Years</option>
            <option value="1960-1970">1960 - 1970</option>
            <option value="1971-1980">1971 - 1980</option>
            <option value="1981-1990">1981 - 1990</option>
            <option value="1991-2000">1991 - 2000</option>
            <option value="2001-2010">2001 - 2010</option>
            <option value="2011-2023">2011 - 2023</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={combined}
            onChange={() => setCombined(!combined)}
          />{" "}
          Show GDP Growth Rate
        </label>

        <button className="export-btn" onClick={exportChart}>
          Export Chart as PNG
        </button>
      </div>

      <Line ref={chartRef} options={options} data={chartData} />

      <div className="explanation">
        <h3>Explanation</h3>
        <p>
          <strong>GDP per Capita</strong> represents the average economic output per person, measured here in current US dollars.
        </p>
        <p>
          <strong>GDP Growth Rate</strong> is calculated as the percentage change in GDP per capita from one year to the next:
        </p>
        <pre>
          Growth Rate (%) = ((GDP_this_year - GDP_previous_year) / GDP_previous_year) × 100
        </pre>
        <p>
          By visualizing both GDP per capita and its growth rate together, you can analyze how economic performance changes over time and observe correlations between overall wealth and growth momentum.
        </p>
      </div>
    </div>
  );
}

export default GDP;
