import React, { useEffect, useState } from "react";

export default function MobilePurchaseWithGDP() {
  const [mobileData, setMobileData] = useState({ overall: [], subgroup: [] });
  const [gdpData, setGdpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch both APIs in parallel
    Promise.all([
      fetch("http://localhost:4000/api/online-merchant").then((res) => res.json()),
      fetch("http://localhost:4000/api/gdp").then((res) => res.json()),
    ])
      .then(([mobileJson, gdpJson]) => {
        // Filter mobile data by UNIT_MEASURE = "PT"
        const filteredMobile = mobileJson.value.filter((item) => item.UNIT_MEASURE === "PT");
        const overall = filteredMobile.filter((item) => item.COMP_BREAKDOWN_1 === "_T");
        const subgroup = filteredMobile.filter((item) => item.COMP_BREAKDOWN_1 === "FINDEX_DEN_IPS");

        overall.sort((a, b) => a.TIME_PERIOD.localeCompare(b.TIME_PERIOD));
        subgroup.sort((a, b) => a.TIME_PERIOD.localeCompare(b.TIME_PERIOD));

        setMobileData({ overall, subgroup });

        // Sort GDP by year ascending
        const sortedGdp = gdpJson.value.sort((a, b) => a.TIME_PERIOD.localeCompare(b.TIME_PERIOD));
        setGdpData(sortedGdp);

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ maxWidth: "700px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Mobile Online Purchases & GDP per Capita in Malaysia</h2>

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Year</th>
            <th>Mobile Purchase Overall (%)</th>
            <th>Mobile Purchase Subgroup (%)</th>
            <th>GDP per Capita (USD)</th>
          </tr>
        </thead>
        <tbody>
            {mobileData.overall.map((mobItem) => {
                const year = mobItem.TIME_PERIOD;
                const overallVal = parseFloat(mobItem.OBS_VALUE).toFixed(2);
                const subgroupItem = mobileData.subgroup.find((item) => item.TIME_PERIOD === year);
                const subgroupVal = subgroupItem ? parseFloat(subgroupItem.OBS_VALUE).toFixed(2) : "-";

                const gdpItem = gdpData.find((item) => item.TIME_PERIOD === year);
                const gdpVal =
                gdpItem && gdpItem.GDP_VALUE != null
                    ? Number(gdpItem.GDP_VALUE).toLocaleString()
                    : "-";

                return (
                <tr key={year}>
                    <td>{year}</td>
                    <td style={{ textAlign: "right" }}>{overallVal}</td>
                    <td style={{ textAlign: "right" }}>{subgroupVal}</td>
                    <td style={{ textAlign: "right" }}>{gdpVal}</td>
                </tr>
                );
            })}
        </tbody>

      </table>

      <p style={{ marginTop: "1rem", lineHeight: "1.5" }}>
        The data shows that as GDP per capita increased from 2017 to 2021, mobile online purchases
        also rose among both the overall population and the subgroup of internet payment service users.
        This suggests a positive correlation where economic growth boosts consumer spending and
        technology adoption.
      </p>
    </div>
  );
}
