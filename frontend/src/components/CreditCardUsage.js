import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { saveAs } from "file-saver";
import axios from "axios"; 
import "./UsageStyles.css";

const CreditCardUsage = () => {
  const [creditData, setCreditData] = useState([]);  // initialize as empty arrays
  const [gdpData, setGdpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCombined, setShowCombined] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = "http://localhost:4000";
        const [creditRes, gdpRes] = await Promise.all([
          axios.get(`${response}/api/credit-card`),
          axios.get(`${response}/api/gdp`),
        ]);

        setCreditData(creditRes.data.value.filter(item => item.UNIT_MEASURE === "ACCT"));
        setGdpData(gdpRes.data.value);
      } catch (err) {
        setError("Failed to fetch data from server.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading data...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  // Defensive checks: ensure data is arrays before using .map()
  if (!Array.isArray(creditData) || !Array.isArray(gdpData)) {
    return <p style={{ textAlign: "center" }}>No valid data found.</p>;
  }

  // Prepare arrays
  const years = creditData.map((d) => d.TIME_PERIOD);
  const creditAccounts = creditData.map((d) => d.OBS_VALUE);
  const gdpValues = gdpData
    .filter((g) => years.includes(g.TIME_PERIOD))
    .map((g) => g.OBS_VALUE);

  // Chart data for credit only
  const chartCreditOnly = {
    labels: years,
    datasets: [
      {
        label: "Credit Card Accounts",
        data: creditAccounts,
        borderColor: "#6c63ff",
        backgroundColor: "#6c63ff",
        yAxisID: "y1",
        tension: 0.3,
        pointRadius: 5,
        fill: false,
      },
    ],
  };

  // Chart data with GDP comparison
  const chartCombined = {
    labels: years,
    datasets: [
      {
        label: "Credit Card Accounts",
        data: creditAccounts,
        borderColor: "#6c63ff",
        backgroundColor: "#6c63ff",
        yAxisID: "y1",
        tension: 0.3,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "GDP per Capita (USD)",
        data: gdpValues,
        borderColor: "#ff6584",
        backgroundColor: "#ff6584",
        yAxisID: "y2",
        tension: 0.3,
        pointRadius: 4,
        fill: false,
      },
    ],
  };

  const optionsCombined = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Year" } },
      y1: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Credit Card Accounts" },
        beginAtZero: true,
        ticks: {
          callback: (val) => (val >= 1e6 ? val / 1e6 + "M" : val),
          color: "#6c63ff",
        },
      },
      y2: {
        type: "linear",
        position: "right",
        title: { display: true, text: "GDP per Capita (USD)" },
        beginAtZero: false,
        grid: { drawOnChartArea: false },
        ticks: { color: "#ff6584" },
      },
    },
  };

  const optionsCreditOnly = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Year" } },
      y: {
        title: { display: true, text: "Credit Card Accounts" },
        beginAtZero: true,
        ticks: {
          callback: (val) => (val >= 1e6 ? val / 1e6 + "M" : val),
          color: "#6c63ff",
        },
      },
    },
  };

  // CSV export helper
  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    return [header, ...rows].join("\n");
  };

  const handleExportCSV = () => {
    let exportData;
    if (showCombined) {
      exportData = years.map((year, i) => ({
        Year: year,
        CreditCardAccounts: creditAccounts[i],
        GDPperCapita: gdpValues[i],
      }));
    } else {
      exportData = years.map((year, i) => ({
        Year: year,
        CreditCardAccounts: creditAccounts[i],
      }));
    }
    const csv = convertToCSV(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, showCombined ? "creditcard_gdp_data.csv" : "creditcard_data.csv");
  };

  const handleDownloadChart = () => {
    if (!chartRef.current) return;
    const chartInstance = chartRef.current;
    const url = chartInstance.toBase64Image();
    const a = document.createElement("a");
    a.href = url;
    a.download = showCombined ? "creditcard_gdp_chart.png" : "creditcard_chart.png";
    a.click();
  };

  return (
    <div className="usage-container">
      <h1>Credit Card Usage in Malaysia</h1>
      <p>
        This graph shows the growth in the number of credit card accounts in Malaysia over a decade.
        The combined mode overlays GDP per capita to explore possible correlation.
      </p>

      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={showCombined}
            onChange={() => setShowCombined(!showCombined)}
          />
          {" "}Show GDP per Capita Comparison
        </label>

        <button onClick={handleExportCSV} className="btn">Export CSV</button>
        <button onClick={handleDownloadChart} className="btn">Download Chart</button>
      </div>

      {showCombined ? (
        <Line data={chartCombined} options={optionsCombined} ref={chartRef} height={400} />
      ) : (
        <Line data={chartCreditOnly} options={optionsCreditOnly} ref={chartRef} height={400} />
      )}

      <p className="explanation">
          <strong>Correlation between Credit Card Accounts and GDP per Capita:</strong>  
            Over the period from 2004 to 2013, the data suggests a positive correlation between the number of credit card accounts and GDP per capita in Malaysia.  
            As GDP per capita increases, indicating higher average income levels and economic growth, there is a corresponding rise in credit card accounts.  
            This reflects that economic prosperity tends to boost consumer confidence and access to financial services, encouraging more people to hold credit cards.  
            However, this relationship does not imply causation, and other factors such as financial regulations, banking outreach, and cultural attitudes may also influence credit card adoption.
            </p>

       <p className="explanation">     
        <strong>Note:</strong> Credit card accounts on left y-axis, GDP per capita (USD) on right y-axis.
      </p>
    </div>
  );
};

export default CreditCardUsage;
