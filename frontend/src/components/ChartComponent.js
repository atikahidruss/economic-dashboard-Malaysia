import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "./ChartStyling.css"; // ✅ Import the CSS file

const Dashboard = () => {
  const [accessAccount, setAccessAccount] = useState([]);
  const [secureServer, setSecureServer] = useState([]);
  const [creditCard, setCreditCard] = useState([]);
  const [awareness, setAwareness] = useState([]);
  const [cybersecurityIndex, setCybersecurityIndex] = useState([]);
  const [loading, setLoading] = useState(true);

  const ageLabelMap = {
    "_T": "All Ages",
    "Y_GE15": "15 years old and over",
    "Y15T24": "15 to 24 years",
    "Y_GE25": "25 years old and over",
  };

  const fetchAndFormat = async (
    endpoint,
    labelKey,
    yearFilter = null,
    breakdownFilter = false,
    customFilter = null
  ) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/${endpoint}`);
      const rawData = res.data.value;

      const filtered = rawData.filter(item => {
        const matchYear = yearFilter ? item.TIME_PERIOD === yearFilter : true;
        const matchBreakdowns = breakdownFilter
          ? item?.COMP_BREAKDOWN_1 === "_T" &&
            item?.COMP_BREAKDOWN_2 === "_T" &&
            item?.COMP_BREAKDOWN_3 === "_T" &&
            item?.SEX === "_T"
          : true;
        const matchCustom = customFilter ? customFilter(item) : true;
        return matchYear && matchBreakdowns && matchCustom;
      });

      return filtered.map(item => ({
        name: ageLabelMap[item[labelKey]] || item[labelKey],
        value: parseFloat(item.OBS_VALUE ?? 0),
      }));
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err.message);
      return [];
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setAccessAccount(await fetchAndFormat("access-account", "AGE", "2017", true));
      setSecureServer(await fetchAndFormat("secure-server", "TIME_PERIOD"));
      setCreditCard(await fetchAndFormat(
        "credit-card",
        "TIME_PERIOD",
        null,
        false,
        item => item.UNIT_MEASURE === "ACCT"
      ));
      setAwareness(await fetchAndFormat("awareness", "TIME_PERIOD"));
      setCybersecurityIndex(await fetchAndFormat("cybersecurity-index", "TIME_PERIOD"));
      setLoading(false);
    };

    fetchAll();
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

  if (loading) {
    return <div className="p-4 text-lg font-semibold">Loading data...</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 pl-4">Data Dashboard</h1>
      <div className="dashboard-container">

        <div className="chart-box">
          <h2 className="chart-title">
            Percentage of Malaysians Used a Mobile Phone or the Internet to Access an Account (2017)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={accessAccount}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {accessAccount.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2 className="chart-title">Malaysia's Secure Internet Servers by Year</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={secureServer}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value, "The number of web sites using HTTPS"]} />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="The number of web sites using HTTPS" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2 className="chart-title">
            Use of Financial Services, Credit Cards Among Malaysians
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={creditCard}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value, "Accounts"]} />
              <Legend />
              <Bar dataKey="value" fill="#ffc658" name="Accounts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2 className="chart-title">Malaysia Public Cybersecurity Awareness Campaigns</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={awareness}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value, "Mean"]} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Mean" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2 className="chart-title">Cybersecurity Index</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cybersecurityIndex}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
