// src/layouts/AppLayout.jsx
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import {
  LocalShipping,
  People,
  Payments,
  TwoWheeler,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon
} from "@mui/icons-material";

const drawerWidth = 260;

const menuItems = [
  {
    label: "Envíos",
    icon: <LocalShipping />,
    children: [
      { label: "Crear envíos", path: "/admin/crear-multiples" },
      { label: "Ver envíos", path: "/admin/envios" },
    ],
  },
  {
    label: "Clientes",
    icon: <People />,
    children: [
      { label: "Crear cliente", path: "/admin/crear-cliente" },
      { label: "Ver clientes", path: "/admin/clientes" },
    ],
  },
  {
    label: "Pagos",
    icon: <Payments />,
    children: [
      { label: "Ver pagos", path: "/admin/pagos" },
    ],
  },
  {
    label: "Repartidores",
    icon: <TwoWheeler />,
    children: [
      { label: "Crear repartidor", path: "/admin/crear-repartidor" },
      { label: "Asignar envíos", path: "/admin/asignar-envios" },
    ],
  },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = React.useState({});
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: drawerWidth, bgcolor: "#f4f4f4", height: "100%" }}>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <Box key={item.label}>
            <ListItemButton onClick={() => handleToggle(item.label)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {openMenus[item.label] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <ListItemButton
                    key={child.label}
                    sx={{ pl: 4 }}
                    selected={location.pathname === child.path}
                    onClick={() => navigate(child.path)}
                  >
                    <ListItemText primary={child.label} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Panel de Administración
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
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
