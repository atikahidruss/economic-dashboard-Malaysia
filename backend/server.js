const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());

// Helper function to fetch from Data360 API with correct DATABASE_ID
const getData = async (indicatorCode, databaseId) => {
  const url = `https://data360api.worldbank.org/data360/data?DATABASE_ID=${databaseId}&INDICATOR=${indicatorCode}&REF_AREA=MYS&skip=0`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return { error: "Failed to fetch data" };
  }
};

// Updated API endpoints with correct DATABASE_IDs

app.get("/api/gdp", async (req, res) => {
  const data = await getData("WB_WDI_NY_GDP_PCAP_CD", "WB_WDI");
  res.json(data);
});

app.get("/api/credit-card", async (req, res) => {
  const data = await getData("IMF_FAS_FCCCC", "IMF_FAS");
  res.json(data);
});

app.get("/api/online-merchant", async (req, res) => {
  const data = await getData("WB_FINDEX_FIN14C_2", "WB_FINDEX");
  res.json(data);
});


app.get("/api/internet-banking", async (req, res) => {
  const data = await getData("IMF_FAS_FCMIBT", "IMF_FAS");
  res.json(data);
});

app.get("/api/inflation", async (req, res) => {
  const data = await getData("WB_WDI_FP_CPI_TOTL_ZG", "WB_WDI");
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
