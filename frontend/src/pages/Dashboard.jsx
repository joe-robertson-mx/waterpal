import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import BoltIcon from "@mui/icons-material/Bolt";
import client from "../api/client";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import useInterval from "../hooks/useInterval";

export default function Dashboard() {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await client.get("/api/status");
      setStatus(response.data);
      setError("");
    } catch (err) {
      setError("Unable to load status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useInterval(() => {
    fetchStatus();
  }, 15000);

  const handleWaterNow = async (zoneId) => {
    try {
      await client.post(`/api/zones/${zoneId}/water`, { duration_sec: 10 });
      fetchStatus();
    } catch (err) {
      setError("Unable to start watering.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const activeZones = status.filter((item) => item.zone.enabled).length;
  const lastReadings = status.filter((item) => item.latest_reading).length;

  return (
    <Stack spacing={4}>
      {error && <Alert severity="error">{error}</Alert>}
      <PageHeader
        title="Dashboard"
        subtitle="Live moisture telemetry and pump control."
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard label="Active zones" value={activeZones} helper="Zones enabled" />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Latest readings" value={lastReadings} helper="Last poll" />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Auto cycles" value="Every 4h" helper="Configurable" />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {status.map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item.zone.id}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{item.zone.name}</Typography>
                    <Chip
                      size="small"
                      label={item.zone.enabled ? "Active" : "Disabled"}
                      color={item.zone.enabled ? "success" : "default"}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Sensor channel {item.zone.sensor_channel}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {item.latest_reading?.value ?? "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Threshold {item.zone.threshold} • Cooldown {item.zone.cooldown_hours}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Water time {item.zone.water_duration_sec}s
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last pump {item.last_pump_event?.created_at ?? "—"}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<WaterDropIcon />}
                      onClick={() => handleWaterNow(item.zone.id)}
                      fullWidth
                    >
                      Water now
                    </Button>
                    <Button variant="outlined" startIcon={<BoltIcon />} fullWidth>
                      Boost
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
