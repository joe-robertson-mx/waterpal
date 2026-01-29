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
  const [creating, setCreating] = useState(false);
  const [newZone, setNewZone] = useState({
    name: "",
    threshold: 16000,
    hysteresis: 800,
    cooldown_hours: 4,
    water_duration_sec: 20,
    sensor_channel: 0,
    pump_gpio: 17,
    enabled: true,
  });

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

  const deleteZone = async (zoneId) => {
    try {
      setSaving(true);
      await client.delete(`/api/zones/${zoneId}`);
      await loadZones();
    } catch (err) {
      setError("Unable to delete zone.");
    } finally {
      setSaving(false);
    }
  };

  const createZone = async () => {
    try {
      setCreating(true);
      await client.post("/api/zones", newZone);
      setNewZone({
        name: "",
        threshold: 16000,
        hysteresis: 800,
        cooldown_hours: 4,
        water_duration_sec: 20,
        sensor_channel: 0,
        pump_gpio: 17,
        enabled: true,
      });
      await loadZones();
    } catch (err) {
      setError("Unable to create zone.");
    } finally {
      setCreating(false);
    }
  };

  const resetDb = async () => {
    try {
      setSaving(true);
      await client.post("/api/reset-db");
      await loadZones();
    } catch (err) {
      setError("Unable to reset database.");
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
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Add zone</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Name"
                  value={newZone.name}
                  onChange={(event) =>
                    setNewZone((prev) => ({ ...prev, name: event.target.value }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Sensor Channel"
                  type="number"
                  value={newZone.sensor_channel}
                  onChange={(event) =>
                    setNewZone((prev) => ({
                      ...prev,
                      sensor_channel: Number(event.target.value),
                    }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Pump GPIO"
                  type="number"
                  value={newZone.pump_gpio ?? ""}
                  onChange={(event) =>
                    setNewZone((prev) => ({
                      ...prev,
                      pump_gpio: event.target.value === "" ? null : Number(event.target.value),
                    }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Threshold"
                  type="number"
                  value={newZone.threshold}
                  onChange={(event) =>
                    setNewZone((prev) => ({
                      ...prev,
                      threshold: Number(event.target.value),
                    }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Hysteresis"
                  type="number"
                  value={newZone.hysteresis}
                  onChange={(event) =>
                    setNewZone((prev) => ({
                      ...prev,
                      hysteresis: Number(event.target.value),
                    }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Cooldown (hours)"
                  type="number"
                  value={newZone.cooldown_hours}
                  onChange={(event) =>
                    setNewZone((prev) => ({
                      ...prev,
                      cooldown_hours: Number(event.target.value),
                    }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Water time (sec)"
                  type="number"
                  value={newZone.water_duration_sec}
                  onChange={(event) =>
                    setNewZone((prev) => ({
                      ...prev,
                      water_duration_sec: Number(event.target.value),
                    }))
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box>
              <Button
                variant="contained"
                disabled={creating || newZone.name.trim() === ""}
                onClick={createZone}
              >
                Add zone
              </Button>
              <Button
                variant="outlined"
                color="warning"
                disabled={saving}
                onClick={resetDb}
                sx={{ ml: 2 }}
              >
                Reset database
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
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
                    label="Water time (sec)"
                    type="number"
                    value={zone.water_duration_sec}
                    onChange={(event) =>
                      handleFieldChange(
                        zone.id,
                        "water_duration_sec",
                        Number(event.target.value)
                      )
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
                        water_duration_sec: zone.water_duration_sec,
                        pump_gpio: zone.pump_gpio,
                        enabled: zone.enabled,
                      })
                    }
                  >
                    Save changes
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={saving}
                    onClick={() => deleteZone(zone.id)}
                  >
                    Delete zone
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
