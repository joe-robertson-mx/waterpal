import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import client from "../api/client";
import PageHeader from "../components/PageHeader";

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadZones = async () => {
    try {
      const response = await client.get("/api/zones");
      setZones(response.data);
      setError("");
    } catch (err) {
      setError("Unable to load zones.");
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const updateZone = async (zoneId, payload) => {
    try {
      setSaving(true);
      await client.patch(`/api/zones/${zoneId}`, payload);
      await loadZones();
    } catch (err) {
      setError("Unable to update zone.");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (zoneId, field, value) => {
    setZones((prev) =>
      prev.map((zone) => (zone.id === zoneId ? { ...zone, [field]: value } : zone))
    );
  };

  return (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}
      <PageHeader title="Zones" subtitle="Tune thresholds and schedules." />
      <Grid container spacing={3}>
        {zones.map((zone) => (
          <Grid item xs={12} md={6} key={zone.id}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{zone.name}</Typography>
                    <Switch
                      checked={zone.enabled}
                      onChange={(event) =>
                        handleFieldChange(zone.id, "enabled", event.target.checked)
                      }
                    />
                  </Stack>
                  <TextField
                    label="Threshold"
                    type="number"
                    value={zone.threshold}
                    onChange={(event) =>
                      handleFieldChange(zone.id, "threshold", Number(event.target.value))
                    }
                  />
                  <TextField
                    label="Hysteresis"
                    type="number"
                    value={zone.hysteresis}
                    onChange={(event) =>
                      handleFieldChange(zone.id, "hysteresis", Number(event.target.value))
                    }
                  />
                  <TextField
                    label="Cooldown (hours)"
                    type="number"
                    value={zone.cooldown_hours}
                    onChange={(event) =>
                      handleFieldChange(zone.id, "cooldown_hours", Number(event.target.value))
                    }
                  />
                  <TextField
                    label="Pump GPIO"
                    type="number"
                    value={zone.pump_gpio ?? ""}
                    onChange={(event) =>
                      handleFieldChange(
                        zone.id,
                        "pump_gpio",
                        event.target.value === "" ? null : Number(event.target.value)
                      )
                    }
                  />
                  <Button
                    variant="contained"
                    disabled={saving}
                    onClick={() =>
                      updateZone(zone.id, {
                        threshold: zone.threshold,
                        hysteresis: zone.hysteresis,
                        cooldown_hours: zone.cooldown_hours,
                        pump_gpio: zone.pump_gpio,
                        enabled: zone.enabled,
                      })
                    }
                  >
                    Save changes
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
