import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Card, CardContent, CircularProgress, Grid } from "@mui/material";
import ReactECharts from "echarts-for-react";
import client from "../api/client";
import PageHeader from "../components/PageHeader";
import useInterval from "../hooks/useInterval";

export default function History() {
  const [zones, setZones] = useState([]);
  const [readings, setReadings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [zonesRes, readingsRes] = await Promise.all([
        client.get("/api/zones"),
        client.get("/api/readings"),
      ]);
      setZones(zonesRes.data);
      setReadings(readingsRes.data);
      setError("");
    } catch (err) {
      setError("Unable to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useInterval(fetchData, 30000);

  const series = useMemo(() => {
    return zones.map((zone) => {
      const zoneReadings = readings
        .filter((reading) => reading.zone_id === zone.id)
        .slice(0, 50)
        .reverse();
      return {
        name: zone.name,
        type: "line",
        smooth: true,
        data: zoneReadings.map((reading) => [reading.created_at, reading.value]),
      };
    });
  }, [zones, readings]);

  const chartOption = {
    tooltip: { trigger: "axis" },
    legend: { data: zones.map((zone) => zone.name), textStyle: { color: "#c4c7d0" } },
    grid: { left: 20, right: 20, top: 40, bottom: 20, containLabel: true },
    xAxis: {
      type: "time",
      axisLabel: { color: "#8b92a1" },
      axisLine: { lineStyle: { color: "#394150" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#8b92a1" },
      splitLine: { lineStyle: { color: "#2a2f3a" } },
    },
    series,
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}
      <PageHeader title="History" subtitle="Moisture trends across zones." />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <ReactECharts option={chartOption} style={{ height: 360 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
