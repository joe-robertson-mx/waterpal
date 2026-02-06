import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import SensorsIcon from "@mui/icons-material/Sensors";
import client from "../api/client";
import PageHeader from "../components/PageHeader";

export default function Connections() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRun, setLastRun] = useState(null);

  const runTest = async () => {
    try {
      setLoading(true);
      const response = await client.get("/api/test-readings");
      setResults(response.data);
      setLastRun(new Date());
      setError("");
    } catch (err) {
      setError("Unable to read sensor channels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}
      <PageHeader
        title="Connections"
        subtitle="Test moisture sensor readings from the Raspberry Pi."
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">Sensor test</Typography>
                <Typography variant="body2" color="text.secondary">
                  Poll each configured sensor channel and confirm live readings.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SensorsIcon />}
                  onClick={runTest}
                  disabled={loading}
                >
                  {loading ? "Testing..." : "Run test"}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {lastRun ? `Last run: ${lastRun.toLocaleString()}` : "Not run yet"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Results</Typography>
                {results.length === 0 && (
                  <Typography color="text.secondary">No sensors configured.</Typography>
                )}
                {results.map((item) => (
                  <Stack
                    key={item.zone.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontWeight: 600 }}>{item.zone.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Channel {item.zone.sensor_channel}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h6">
                        {item.value ?? "—"}
                      </Typography>
                      <Chip
                        size="small"
                        label={item.status === "ok" ? "OK" : "Error"}
                        color={item.status === "ok" ? "success" : "error"}
                      />
                    </Stack>
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
