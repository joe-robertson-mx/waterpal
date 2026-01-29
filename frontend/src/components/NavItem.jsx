import { ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export default function NavItem({ to, icon, label }) {
  const location = useLocation();
  const selected = location.pathname === to;

  return (
    <ListItem disablePadding>
      <ListItemButton component={Link} to={to} selected={selected}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );
}
