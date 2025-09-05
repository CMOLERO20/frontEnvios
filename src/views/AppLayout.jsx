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
  useTheme
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
/*   {
    label: "Envíos",
    icon: <LocalShipping />,
    children: [
      { label: "Crear envíos", path: "/admin/crear-multiples" },
      { label: "Ver envíos", path: "/admin/envios" },
    ],
  }, */
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
    children: [{ label: "Ver pagos", path: "/admin/pagos" },
      { label: "Confirmar transferencias", path: "/admin/confirmar-transferencia" },
      { label: "Registrar Pago C/C", path: "/admin/registrar-pago-cc" }
    ],
  },
/*   {
    label: "Repartidores",
    icon: <TwoWheeler />,
    children: [
      { label: "Crear repartidor", path: "/admin/crear-repartidor" },
      { label: "Asignar envíos", path: "/admin/asignar-envios" },
    ],
  }, */
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = React.useState({});
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
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
                    onClick={() => {
                      navigate(child.path);
                      setMobileOpen(false); // Cierra drawer móvil al navegar
                    }}
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
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Panel de Administración
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer para escritorio */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Drawer móvil colapsable */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
