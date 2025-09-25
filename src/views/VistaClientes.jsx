import React, { useEffect, useMemo, useState } from "react";
import {
  Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, TableContainer, Toolbar, Stack, OutlinedInput, InputAdornment,
  IconButton, Chip, Tooltip, Avatar, Skeleton, TableSortLabel, Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import { getClients } from "../utils/clientes.jsx"; // usa tu util
function avatarColor(seed = "") {
  // colorcito estable por nombre
  const colors = ["#7e57c2","#42a5f5","#26a69a","#ef5350","#ab47bc","#29b6f6","#66bb6a","#ffa726","#8d6e63"];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}

const columns = [
  { id: "nombre", label: "Nombre" },
  { id: "email", label: "Email" },
  { id: "telefono", label: "Teléfono" },
];

function sortComparator(a, b, orderBy) {
  const av = (a?.[orderBy] ?? "").toString().toLowerCase();
  const bv = (b?.[orderBy] ?? "").toString().toLowerCase();
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
}

export default function ClientesAdmin() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [filtroDebounced, setFiltroDebounced] = useState("");
  const [orderBy, setOrderBy] = useState("nombre");
  const [order, setOrder] = useState("asc"); // 'asc' | 'desc'
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // carga inicial
  const fetchData = async () => {
    setLoading(true);
    try {
      const arr = await getClients(); // debe devolver [{id|uid, nombre, email, telefono, ...}]
      setClientes(Array.isArray(arr) ? arr : []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  // debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => setFiltroDebounced(filtro.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [filtro]);

  const clientesFiltrados = useMemo(() => {
    if (!filtroDebounced) return clientes;
    return clientes.filter((c) => {
      const nombre = (c.nombre || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const tel = (c.telefono || "").toLowerCase();
      return (
        nombre.includes(filtroDebounced) ||
        email.includes(filtroDebounced) ||
        tel.includes(filtroDebounced)
      );
    });
  }, [clientes, filtroDebounced]);

  const clientesOrdenados = useMemo(() => {
    const arr = [...clientesFiltrados].sort((a, b) => sortComparator(a, b, orderBy));
    return order === "asc" ? arr : arr.reverse();
  }, [clientesFiltrados, orderBy, order]);

  const paginados = useMemo(() => {
    const start = page * rowsPerPage;
    return clientesOrdenados.slice(start, start + rowsPerPage);
  }, [clientesOrdenados, page, rowsPerPage]);

  const handleRequestSort = (colId) => {
    if (orderBy === colId) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(colId);
      setOrder("asc");
    }
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Toolbar disableGutters sx={{ mb: 2, gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mr: 1 }}>
          👥 Clientes
        </Typography>

        <Chip
          size="small"
          label={`Total: ${clientes.length}`}
          sx={{ bgcolor: "grey.100" }}
        />
        <Chip
          size="small"
          label={`Filtrados: ${clientesFiltrados.length}`}
          sx={{ bgcolor: "grey.100" }}
        />

        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
          <OutlinedInput
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono…"
            size="small"
            sx={{ minWidth: 320, bgcolor: "background.paper" }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
          />
          <Tooltip title="Refrescar">
            <span>
              <IconButton onClick={fetchData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/crear-cliente")}
          >
            Nuevo cliente
          </Button>
        </Stack>
      </Toolbar>

      {/* Tabla */}
      <Paper elevation={1}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size="small" stickyHeader>
            <TableHead sx={{ "& th": { bgcolor: "grey.50", fontWeight: 600 } }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.id} sortDirection={orderBy === col.id ? order : false}>
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleRequestSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                "& tr:nth-of-type(odd)": { bgcolor: "action.hover" },
                "& td": { py: 1.0 },
              }}
            >
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={3}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No hay resultados para la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                paginados.map((cliente) => {
                  const id = cliente.id || cliente.uid; // asegura navegación válida
                  const nombre = cliente.nombre || "-";
                  return (
                    <TableRow
                      key={id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/admin/clientes/${id}`)}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: avatarColor(nombre),
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {nombre?.[0]?.toUpperCase() || "?"}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {nombre}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{cliente.email || "-"}</TableCell>
                      <TableCell>{cliente.telefono || "-"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={clientesFiltrados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
}
