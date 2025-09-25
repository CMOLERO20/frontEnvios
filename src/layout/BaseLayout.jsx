// src/layout/AppLayout.jsx
import * as React from "react";
import {
  AppBar, Toolbar, Typography, Drawer, CssBaseline, IconButton, Box,
  List, ListItemButton, ListItemIcon, ListItemText, Collapse
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

const drawerWidth = 260;

export default function AppLayout({ title = "Panel", menuItems = [], currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [openMenus, setOpenMenus] = React.useState({});
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleDrawerToggle = () => setMobileOpen((v) => !v);

  // Abrir por defecto el grupo que contiene la ruta actual
  React.useEffect(() => {
    const map = {};
    for (const g of menuItems) {
      const hasChildActive = g.children?.some((c) => location.pathname.startsWith(c.path));
      map[g.label] = !!hasChildActive;
    }
    setOpenMenus((prev) => ({ ...prev, ...map }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, menuItems]);

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
                {item.children?.map((child) => {
                  const selected = location.pathname === child.path;
                  return (
                    <ListItemButton
                      key={child.label}
                      sx={{ pl: 4 }}
                      selected={selected}
                      onClick={() => {
                        navigate(child.path);
                        setMobileOpen(false);
                      }}
                    >
                      <ListItemText primary={child.label} />
                    </ListItemButton>
                  );
                })}
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

      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
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

          <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
            {title}
          </Typography>

          {/* Info de usuario (opcional) */}
          <Typography variant="body2" noWrap>
            {currentUser?.displayName || currentUser?.nombre || currentUser?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer escritorio */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Drawer móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Contenido */}
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
