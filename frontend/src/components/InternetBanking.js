import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { saveAs } from "file-saver";
import axios from "axios";
import "./UsageStyles.css";

const YourGraphComponent = () => {
  const [internetBankingData, setInternetBankingData] = useState([]);
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

        const baseURL = "http://localhost:4000"; // adjust as needed
        const [res1, res2] = await Promise.all([
          axios.get(`${baseURL}/api/internet-banking`),
          axios.get(`${baseURL}/api/gdp`),
        ]);

        setInternetBankingData(res1.data.value.filter(item => item.UNIT_MEASURE === "TRANSACT"));
        setGdpData(res2.data.value || []);
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading data...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  if (!Array.isArray(internetBankingData) || !Array.isArray(gdpData)) {
    return <p style={{ textAlign: "center" }}>No valid data found.</p>;
  }

  // Extract years as strings (TIME_PERIOD)
  const internetYears = internetBankingData.map((d) => d.TIME_PERIOD);
  const gdpYears = gdpData.map((d) => d.TIME_PERIOD);
  const commonYears = internetYears.filter((year) => gdpYears.includes(year));

  // Sort years numerically ascending
  commonYears.sort((a, b) => parseInt(a) - parseInt(b));

  // Map Internet Banking values: OBS_VALUE * 10^UNIT_MULT (UNIT_MULT = 6)
  const internetValues = commonYears.map((year) => {
    const found = internetBankingData.find((d) => d.TIME_PERIOD === year);
    if (!found) return 0;
    const value = parseFloat(found.OBS_VALUE);
    const multiplier = Math.pow(10, found.UNIT_MULT || 0);
    return isNaN(value) ? 0 : value * multiplier;
  });

  // Map GDP values: OBS_VALUE parsed as float, DECIMALS available but not used in calculation
  const gdpValues = commonYears.map((year) => {
    const found = gdpData.find((d) => d.TIME_PERIOD === year);
    if (!found) return 0;
    const value = parseFloat(found.OBS_VALUE);
    return isNaN(value) ? 0 : value;
  });

  // Chart datasets
  const chartDataSingle = {
    labels: commonYears,
    datasets: [
      {
        label: "Internet Banking (TRANSACT)",
        data: internetValues,
        borderColor: "#6c63ff",
        backgroundColor: "#6c63ff",
        yAxisID: "y1",
        tension: 0.3,
        pointRadius: 5,
        fill: false,
      },
    ],
  };

  const chartDataCombined = {
    labels: commonYears,
    datasets: [
      {
        label: "Internet Banking (TRANSACT)",
        data: internetValues,
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

  const optionsSingle = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Year" } },
      y1: {
        title: { display: true, text: "Internet Banking (TRANSACT)" },
        beginAtZero: true,
        ticks: { color: "#6c63ff" },
      },
    },
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
        title: { display: true, text: "Internet Banking (TRANSACT)" },
        beginAtZero: true,
        ticks: { color: "#6c63ff" },
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

  // CSV export helper
  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    return [header, ...rows].join("\n");
  };

  const handleExportCSV = () => {
    let exportData;
    if (showCombined) {
      exportData = commonYears.map((year, i) => ({
        Year: year,
        "Internet Banking": internetValues[i],
        "GDP per Capita": gdpValues[i],
      }));
    } else {
      exportData = commonYears.map((year, i) => ({
        Year: year,
        "Internet Banking": internetValues[i],
      }));
    }
    const csv = convertToCSV(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, showCombined ? "combined_data.csv" : "internet_banking_data.csv");
  };

  const handleDownloadChart = () => {
    if (!chartRef.current) return;
    const url = chartRef.current.toBase64Image();
    const a = document.createElement("a");
    a.href = url;
    a.download = showCombined ? "combined_chart.png" : "internet_banking_chart.png";
    a.click();
  };

  return (
    <div className="usage-container">
      <h1>Internet Banking vs GDP Over Time</h1>
      <p>Comparison of Internet Banking volume (in TRANSACT) and GDP per capita (in USD) across years.</p>

      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={showCombined}
            onChange={() => setShowCombined(!showCombined)}
          />{" "}
          Show GDP Comparison
        </label>
        <button onClick={handleExportCSV} className="btn">
          Export CSV
        </button>
        <button onClick={handleDownloadChart} className="btn">
          Download Chart
        </button>
      </div>

      {showCombined ? (
        <Line data={chartDataCombined} options={optionsCombined} ref={chartRef} height={400} />
      ) : (
        <Line data={chartDataSingle} options={optionsSingle} ref={chartRef} height={400} />
      )}

      <p className="explanation">
        <strong>Insight:</strong> Internet banking transaction volume and GDP per capita are often positively correlated because as a country’s economy grows and people become wealthier (higher GDP per capita), they tend to use more digital financial services like internet banking. Increased income generally leads to more financial activity, greater access to technology, and a higher adoption rate of online banking platforms.

In your chart, by plotting both variables over the same years with dual y-axes, you can visually assess this relationship:

When GDP per capita rises, internet banking transactions often rise as well, indicating economic growth supports greater digital finance adoption.

However, the growth rates might differ — internet banking could grow faster due to technological improvements, government policies, or cultural shifts encouraging online banking.

Sometimes, short-term dips or fluctuations in internet banking may not exactly match GDP changes, reflecting factors like financial crises, infrastructure issues, or regulatory changes affecting internet banking usage but not overall economic output.

Thus, while there is generally a positive correlation, the strength and timing of the correlation can vary based on external influences.
      </p>
      <p className="explanation">
        <strong>Note:</strong> Left y-axis shows Internet Banking volume (TRANSACT), right y-axis shows GDP per capita (USD).
      </p>
    </div>
  );
};

export default YourGraphComponent;
