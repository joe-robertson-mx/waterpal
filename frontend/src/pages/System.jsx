import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import client from "../api/client";
import PageHeader from "../components/PageHeader";

export default function System() {
  const [status, setStatus] = useState([]);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await client.get("/api/status");
      setStatus(response.data);
      setError("");
    } catch (err) {
      setError("Unable to load system status.");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

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
      </Grid>
    </Box>
  );
}
