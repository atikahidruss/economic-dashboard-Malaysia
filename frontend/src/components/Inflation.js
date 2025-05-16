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
import "./Inflation.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Inflation() {
  const chartRef = useRef(null);
  const [gdpData, setGdpData] = useState([]);
  const [inflationData, setInflationData] = useState([]);
  const [yearRange, setYearRange] = useState("all");
  const [combined, setCombined] = useState(false);

  // Fetch GDP data
  useEffect(() => {
    const fetchGDP = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/gdp");
        setGdpData(response.data.value || []);
      } catch (error) {
        console.error("Error fetching GDP data:", error);
      }
    };
    fetchGDP();
  }, []);

  // Fetch Inflation data
  useEffect(() => {
    const fetchInflation = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/inflation");
        setInflationData(response.data.value || []);
      } catch (error) {
        console.error("Error fetching inflation data:", error);
      }
    };
    fetchInflation();
  }, []);

  // Process GDP data: extract year and GDP per capita
  const processedGDP = gdpData
    .map((d) => ({
      year: Number(d.TIME_PERIOD),
      gdp: Number(d.OBS_VALUE),
    }))
    .sort((a, b) => a.year - b.year);

  // Process inflation data: extract year and inflation rate (convert to %)
  const processedInflation = inflationData
    .map((d) => ({
      year: Number(d.TIME_PERIOD),
      inflation: Number(d.OBS_VALUE) * 100, // from fraction to percentage
    }))
    .sort((a, b) => a.year - b.year);

  // Filter by yearRange
  let filteredGDP = processedGDP;
  let filteredInflation = processedInflation;

  if (yearRange !== "all") {
    const [start, end] = yearRange.split("-").map(Number);
    filteredGDP = processedGDP.filter((d) => d.year >= start && d.year <= end);
    filteredInflation = processedInflation.filter((d) => d.year >= start && d.year <= end);
  }

  // Labels are years from filteredGDP (assuming same years available)
  const labels = filteredGDP.map((d) => d.year.toString());

  // Prepare inflation data aligned to labels by matching year (handle missing years)
  const inflationMap = new Map(filteredInflation.map((d) => [d.year, d.inflation]));
  const alignedInflation = labels.map((year) =>
    inflationMap.has(Number(year)) ? inflationMap.get(Number(year)) : null
  );

  // Chart datasets
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
      label: "Inflation Rate (%)",
      data: alignedInflation,
      borderColor: "rgba(255, 159, 64, 1)",
      backgroundColor: "rgba(255, 159, 64, 0.2)",
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
          callback: (value) => "$" + value.toLocaleString(),
          maxTicksLimit: 7,
        },
      },
      y2: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Inflation Rate (%)",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: (value) => value + "%",
          maxTicksLimit: 7,
        },
        min: Math.min(...alignedInflation.filter(v => v !== null)) - 1,
        max: Math.max(...alignedInflation.filter(v => v !== null)) + 1,
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
            if (context.dataset.label === "Inflation Rate (%)") {
              return `${context.dataset.label}: ${context.parsed.y?.toFixed(2)}%`;
            }
            return `${context.dataset.label}: $${context.parsed.y?.toLocaleString()}`;
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
    link.download = "inflation-chart.png";
    link.click();
  };

  return (
    <div className="inflation-container">
      <h2>GDP per Capita and Inflation Rate Analysis (Malaysia)</h2>

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
          Show Inflation Rate
        </label>

        <button className="export-btn" onClick={exportChart}>
          Export Chart as PNG
        </button>
      </div>

      <Line ref={chartRef} options={options} data={chartData} />

      <div className="explanation">
        <h3>Explanation</h3>
        <p>
            <strong>GDP per Capita</strong> represents the average economic output per person in Malaysia, measured in current US dollars. It reflects the country’s economic growth or contraction over time.
        </p>
        <p>
            <strong>Inflation Rate</strong> shows the annual percentage change in consumer prices. A rising inflation rate means prices are increasing, while a falling rate indicates slower price growth or deflation.
        </p>
        <p>
            Observing the trends, we see that during the <strong>2009 financial crisis</strong>, GDP per capita declined or stagnated due to reduced economic activity, while inflation often fell or even became negative as demand dropped sharply. This reflects the recessionary pressure where consumers spend less and prices stabilize or fall.
        </p>
        <p>
            In contrast, during the <strong>2020 COVID-19 pandemic</strong>, GDP per capita again experienced a significant dip due to lockdowns and economic slowdowns. However, inflation showed more volatility — initial price drops in some sectors were followed by spikes caused by supply chain disruptions and stimulus-driven demand increases.
        </p>
        <p>
            Correlating both datasets, economic crises tend to cause a contraction in GDP per capita alongside unusual inflation patterns: low or negative inflation during recessions, and volatile inflation during recovery phases. Visualizing these together helps understand how economic output and price stability interact during major shocks.
        </p>
        </div>
    </div>
  );
}

export default Inflation;
