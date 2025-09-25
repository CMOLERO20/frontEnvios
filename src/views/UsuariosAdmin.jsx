// src/views/UsuariosAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Toolbar,
  Stack,
  Button,
  TextField,
  MenuItem,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

import { ROLES } from "../constants/roles";
import { subscribeUsers, setUserActive } from "../utils/users";

import UsuariosTable from "../components/material/UsuariosTable";
import UsuarioDialog from "../components/material/UsuariosDialog";

function sortComparator(a, b, orderBy) {
  const av = (a?.[orderBy] ?? "").toString().toLowerCase();
  const bv = (b?.[orderBy] ?? "").toString().toLowerCase();
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
}

export default function UsuariosAdmin() {
  const { enqueueSnackbar } = useSnackbar();

  // data
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros / orden
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [orderBy, setOrderBy] = useState("nombre");
  const [order, setOrder] = useState("asc");

  // paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [modoDialog, setModoDialog] = useState("crear"); // 'crear' | 'editar'
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  // suscripción (sin orderBy del lado del servidor)
  useEffect(() => {
    const unsub = subscribeUsers(
      (arr) => {
        setUsuarios(arr);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        enqueueSnackbar("No se pudieron cargar los usuarios.", { variant: "error" });
        setLoading(false);
      }
    );
    return () => unsub && unsub();
  }, [enqueueSnackbar]);

  // debounce búsqueda
  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda.trim().toLowerCase()), 220);
    return () => clearTimeout(t);
  }, [busqueda]);

  // derivados
  const filtrados = useMemo(() => {
    const s = busquedaDebounced;
    return (usuarios || []).filter((u) => {
      if (filtroRol && (u.role || "").toLowerCase() !== filtroRol) return false;
      if (!s) return true;
      return (
        (u.nombre || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s) ||
        (u.telefono || "").toLowerCase().includes(s)
      );
    });
  }, [usuarios, busquedaDebounced, filtroRol]);

  const ordenados = useMemo(() => {
    const arr = [...filtrados].sort((a, b) => sortComparator(a, b, orderBy));
    return order === "asc" ? arr : arr.reverse();
  }, [filtrados, orderBy, order]);

  const paginados = useMemo(() => {
    const start = page * rowsPerPage;
    return ordenados.slice(start, start + rowsPerPage);
  }, [ordenados, page, rowsPerPage]);

  // handlers
  const handleRequestSort = (colId) => {
    if (orderBy === colId) setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setOrderBy(colId);
      setOrder("asc");
    }
  };

  const openCrear = () => {
    setModoDialog("crear");
    setUsuarioEdit(null);
    setOpenDialog(true);
  };
  const openEditar = (u) => {
    setModoDialog("editar");
    setUsuarioEdit(u);
    setOpenDialog(true);
  };

  const toggleActivo = async (u) => {
    try {
      await setUserActive(u.id, !u.activo);
      enqueueSnackbar(!u.activo ? "Usuario activado" : "Usuario desactivado", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("No se pudo cambiar el estado.", { variant: "error" });
    }
  };

  // “Refresh” visual rápido (la suscripción es tiempo real)
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <Box maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header / filtros */}
      <Toolbar disableGutters sx={{ mb: 2, gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" fontWeight="bold">
          👤 Usuarios
        </Typography>

        <Chip size="small" label={`Total: ${usuarios.length}`} sx={{ bgcolor: "grey.100" }} />
        <Chip size="small" label={`Filtrados: ${filtrados.length}`} sx={{ bgcolor: "grey.100" }} />

        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
          <OutlinedInput
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono…"
            size="small"
            sx={{ minWidth: 300, bgcolor: "background.paper" }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
          />
          <TextField
            label="Rol"
            select
            size="small"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            sx={{ width: 170 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCrear}>
            Nuevo usuario
          </Button>
        </Stack>
      </Toolbar>

      {/* Lista */}
      <Paper elevation={1}>
        <UsuariosTable
          rows={paginados}
          loading={loading}
          totalCount={ordenados.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          orderBy={orderBy}
          order={order}
          onRequestSort={handleRequestSort}
          onEdit={openEditar}
          onToggleActivo={toggleActivo}
        />
      </Paper>

      {/* Modal crear/editar (acá se cambia el rol) */}
      <UsuarioDialog
        open={openDialog}
        modo={modoDialog}
        usuario={usuarioEdit}
        onClose={() => setOpenDialog(false)}
      />
    </Box>
  );
}
