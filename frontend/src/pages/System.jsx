import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import client from "../api/client";
import PageHeader from "../components/PageHeader";

export default function System() {
  const [status, setStatus] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [filters, setFilters] = useState({
    acknowledged: "unacked",
    alertType: "",
    zoneId: "",
  });

  const fetchStatus = async () => {
    try {
      const params = {};
      if (filters.alertType) params.alert_type = filters.alertType;
      if (filters.zoneId) params.zone_id = Number(filters.zoneId);
      if (filters.acknowledged === "acked") params.acknowledged = true;
      if (filters.acknowledged === "unacked") params.acknowledged = false;

      const [statusRes, alertRes] = await Promise.all([
        client.get("/api/status"),
        client.get("/api/alerts", { params }),
      ]);
      setStatus(statusRes.data);
      setAlerts(alertRes.data);
      setError("");
    } catch (err) {
      setError("Unable to load system status.");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [filters]);

  const runCycle = async () => {
    try {
      setRunning(true);
      await client.post("/api/run-cycle");
      await fetchStatus();
    } catch (err) {
      setError("Unable to run cycle.");
    } finally {
      setRunning(false);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await client.post(`/api/alerts/${alertId}/ack`);
      await fetchStatus();
    } catch (err) {
      setError("Unable to acknowledge alert.");
    }
  };

  return (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}
      <PageHeader title="System" subtitle="Diagnostics and manual operations." />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">Manual cycle</Typography>
                <Typography variant="body2" color="text.secondary">
                  Trigger a one-time sensor read and auto-watering check.
                </Typography>
                <Button variant="contained" onClick={runCycle} disabled={running}>
                  Run cycle
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Zone health</Typography>
                {status.map((item) => (
                  <Stack
                    key={item.zone.id}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography>{item.zone.name}</Typography>
                    <Typography color="text.secondary">
                      Last reading: {item.latest_reading?.value ?? "—"}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Recent alerts</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Acknowledgement"
                      value={filters.acknowledged}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, acknowledged: event.target.value }))
                      }
                      fullWidth
                    >
                      <MenuItem value="unacked">Unacknowledged</MenuItem>
                      <MenuItem value="acked">Acknowledged</MenuItem>
                      <MenuItem value="all">All</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Alert type"
                      value={filters.alertType}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, alertType: event.target.value }))
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Zone ID"
                      value={filters.zoneId}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, zoneId: event.target.value }))
                      }
                      fullWidth
                    />
                  </Grid>
                </Grid>
                {alerts.length === 0 && (
                  <Typography color="text.secondary">No alerts yet.</Typography>
                )}
                {alerts.slice(0, 10).map((alert) => (
                  <Stack key={alert.id} spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 600 }}>{alert.alert_type}</Typography>
                      {!alert.acknowledged && (
                        <Button size="small" onClick={() => acknowledgeAlert(alert.id)}>
                          Acknowledge
                        </Button>
                      )}
                    </Stack>
                    <Typography color="text.secondary">{alert.message}</Typography>
                    <Typography color="text.secondary">
                      {new Date(alert.created_at).toLocaleString()}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
