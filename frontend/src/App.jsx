import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/Timeline";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NavItem from "./components/NavItem";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Zones from "./pages/Zones";
import System from "./pages/System";

const drawerWidth = 260;

export default function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Avatar sx={{ bgcolor: "secondary.main" }}>W</Avatar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              WaterPal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Raspberry Pi Control
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto", p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Monitoring
            </Typography>
            <List>
              <NavItem to="/" icon={<DashboardIcon />} label="Dashboard" />
              <NavItem to="/history" icon={<TimelineIcon />} label="History" />
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" color="text.secondary">
              Configuration
            </Typography>
            <List>
              <NavItem to="/zones" icon={<TuneIcon />} label="Zones" />
              <NavItem to="/system" icon={<SettingsIcon />} label="System" />
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
          <Toolbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/zones" element={<Zones />} />
            <Route path="/system" element={<System />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}
