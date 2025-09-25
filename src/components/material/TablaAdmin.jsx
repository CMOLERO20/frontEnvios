import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Typography,
  MenuItem,
  Checkbox,
  Chip,
  Tooltip,
  Toolbar,
  Divider,
} from "@mui/material";
import { Edit, Delete, Info, Print, ClearAll } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { downloadEtiquetaPDF } from "../../utils/etiquetas";
import ModalEliminarEnvio from "./ModalEliminarEnvio";
import ModalDetalleEnvio from "./ModalDetalleEnvio";
import ModalEditarEnvio from "./ModalEditarEnvio";

export default function TablaAdmin({
  envios,
  onEditar,
  onSeleccionar,
  enviosSeleccionados,
  onUpdate,
}) {
  const [filtroTexto, setFiltroTexto] = useState("");
  const [fechaDesde, setFechaDesde] = useState(null); // dayjs | null
  const [fechaHasta, setFechaHasta] = useState(null); // dayjs | null
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtrados, setFiltrados] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [seleccionados, setSeleccionados] = useState([]);
  const [envioAEliminar, setEnvioAEliminar] = useState(null);
  const [envioAEditar, setEnvioAEditar] = useState(null);
  const [verDetalleAbierto, setVerDetalleAbierto] = useState(false);
  const [envioDetalle, setEnvioDetalle] = useState(null);

  // Sincronizar selección externa si cambia la prop
  useEffect(() => {
    setSeleccionados(enviosSeleccionados || []);
  }, [enviosSeleccionados]);

  // Filtros + orden
  useEffect(() => {
    let nuevos = Array.isArray(envios) ? [...envios] : [];

    // Fechas (usando dayjs)
    if (fechaDesde) {
      const d = dayjs(fechaDesde).startOf("day");
      nuevos = nuevos.filter((e) => {
        const created =
          e.creado?.toDate?.() ||
          (e.creado ? new Date(e.creado) : null);
        return created ? dayjs(created).isSameOrAfter(d) : false;
      });
    }
    if (fechaHasta) {
      const h = dayjs(fechaHasta).endOf("day");
      nuevos = nuevos.filter((e) => {
        const created =
          e.creado?.toDate?.() ||
          (e.creado ? new Date(e.creado) : null);
        return created ? dayjs(created).isSameOrBefore(h) : false;
      });
    }

    // Texto
    if (filtroTexto.trim()) {
      const t = filtroTexto.toLowerCase();
      nuevos = nuevos.filter((e) => {
        const fields = [
          e.senderName,
          e.venta,
          e.recieverAddress,
          e.localidad,
          e.zona,
          e.estado,
          e.numeroEnvio,
        ];
        return fields.some((f) => (f || "").toString().toLowerCase().includes(t));
      });
    }

    // Estado
    if (filtroEstado) {
      nuevos = nuevos.filter((e) => (e.estado || "").toLowerCase() === filtroEstado.toLowerCase());
    }

    // Orden: más recientes primero
    nuevos.sort((a, b) => {
      const fechaA = a.creado?.toDate?.() || (a.creado ? new Date(a.creado) : new Date(0));
      const fechaB = b.creado?.toDate?.() || (b.creado ? new Date(b.creado) : new Date(0));
      return fechaB - fechaA;
    });

    setFiltrados(nuevos);
    setPage(0);
  }, [envios, fechaDesde, fechaHasta, filtroTexto, filtroEstado]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginados = useMemo(() => {
    const start = page * rowsPerPage;
    return filtrados.slice(start, start + rowsPerPage);
  }, [filtrados, page, rowsPerPage]);

  const formatFecha = (value) => {
    const d = value?.toDate ? value.toDate() : (value ? new Date(value) : null);
    if (!d) return "—";
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Selección
  const estaSeleccionado = (id) => seleccionados.some((e) => e.id === id);
  const selectedOnPageCount = paginados.filter((e) => estaSeleccionado(e.id)).length;
  const allSelectedOnPage = paginados.length > 0 && selectedOnPageCount === paginados.length;

  const handleToggle = (envio) => {
    setSeleccionados((prev) =>
      prev.some((e) => e.id === envio.id)
        ? prev.filter((e) => e.id !== envio.id)
        : [...prev, envio]
    );
  };

  const toggleSeleccionTodos = (checked) => {
    setSeleccionados((prev) => {
      if (!checked) {
        // des-seleccionar solo los de esta página
        return prev.filter((e) => !paginados.some((p) => p.id === e.id));
      }
      // agregar los de esta página que no estén
      const nuevos = paginados.filter((envio) => !prev.some((s) => s.id === envio.id));
      return [...prev, ...nuevos];
    });
  };

  useEffect(() => {
    const idsSeleccionados = seleccionados.map((e) => e.id);
    onSeleccionar?.(idsSeleccionados);
  }, [seleccionados, onSeleccionar]);

  const handleCerrarEliminar = () => {
    setEnvioAEliminar(null);
    onUpdate?.();
  };
  const handleCerrarEditar = () => {
    setEnvioAEditar(null);
    onUpdate?.();
  };

  // Colores de estado
  const estadoColor = (estado) => {
    const s = (estado || "").toLowerCase();
    if (s === "pendiente") return "warning";
    if (s === "en camino" || s === "yendo al domicilio") return "info";
    if (s === "entregado") return "success";
    if (s === "cancelado" || s === "demorado") return "error";
    return "default";
  };

  // Imprimir etiqueta (fila)
  const imprimirEtiqueta = (envio) => {
    const numeroEnvio = envio.numeroEnvio || (envio.id ? `ENV-${String(envio.id).slice(-8).toUpperCase()}` : "ENV-XXXXXX");
    const destinatario = {
      nombre: envio.recieverName || envio.destinatario?.nombre || "-",
      direccion: envio.recieverAddress || envio.destinatario?.direccion || "",
      localidad: envio.localidad || envio.destinatario?.localidad || "",
      zona: envio.zona || envio.destinatario?.zona || "",
      telefono: envio.recieverPhone || envio.destinatario?.telefono || "",
    };
    downloadEtiquetaPDF({
      numeroEnvio,
      remitenteNombre: envio.senderName || "-",
      destinatario,
    });
  };

  // Imprimir etiquetas (seleccionados)
  const imprimirEtiquetasSeleccionados = () => {
    if (seleccionados.length === 0) return;
    seleccionados.forEach(imprimirEtiqueta);
  };

  const limpiarFiltros = () => {
    setFiltroTexto("");
    setFechaDesde(null);
    setFechaHasta(null);
    setFiltroEstado("");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
        {/* Filtros */}
        <Toolbar
          sx={{
            px: 0,
            py: 1,
            mb: 1,
            gap: 2,
            borderRadius: 1,
            bgcolor: "grey.50",
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Buscar"
            size="small"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            sx={{ minWidth: 220 }}
            placeholder="Remitente, dirección, zona, MLID..."
          />

          <DatePicker
            label="Desde"
            value={fechaDesde}
            onChange={(v) => setFechaDesde(v)}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
          />
          <DatePicker
            label="Hasta"
            value={fechaHasta}
            onChange={(v) => setFechaHasta(v)}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
          />

          <TextField
            select
            label="Estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="En camino">En camino</MenuItem>
            <MenuItem value="Yendo al domicilio">Yendo al domicilio</MenuItem>
            <MenuItem value="Entregado">Entregado</MenuItem>
            <MenuItem value="Cancelado">Cancelado</MenuItem>
            <MenuItem value="Demorado">Demorado</MenuItem>
          </TextField>

          <Box sx={{ flexGrow: 1 }} />

          {seleccionados.length > 0 && (
            <Chip
              label={`${seleccionados.length} seleccionado${seleccionados.length !== 1 ? "s" : ""}`}
              color="primary"
              variant="outlined"
            />
          )}

          <Tooltip title="Limpiar filtros">
            <IconButton onClick={limpiarFiltros}>
              <ClearAll />
            </IconButton>
          </Tooltip>

          <Tooltip title="Imprimir etiquetas (seleccionados)">
            <span>
              <IconButton onClick={imprimirEtiquetasSeleccionados} disabled={seleccionados.length === 0}>
                <Print />
              </IconButton>
            </span>
          </Tooltip>
        </Toolbar>

        <Divider sx={{ mb: 1 }} />

        {/* Tabla */}
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "grey.100" }} width={48}>
                  <Checkbox
                    indeterminate={selectedOnPageCount > 0 && !allSelectedOnPage}
                    checked={allSelectedOnPage}
                    onChange={(e) => toggleSeleccionTodos(e.target.checked)}
                    inputProps={{ "aria-label": "Seleccionar página" }}
                  />
                </TableCell>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: 600 }}>Remitente</TableCell>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: 600 }}>MLID</TableCell>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: 600 }}>Dirección</TableCell>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: 600 }}>Localidad</TableCell>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: 600 }}>Zona</TableCell>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: 600 }}>Fecha</TableCell>
                {/* Repartidor eliminado */}
                <TableCell sx={{ bgcolor: "grey.100", fontWeight: 600 }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                "& tr:nth-of-type(odd)": { bgcolor: "action.hover" },
                "& td": { py: 1 },
              }}
            >
              {paginados.map((envio) => {
                const selected = estaSeleccionado(envio.id);
                return (
                  <TableRow key={envio.id || envio.numeroEnvio} hover selected={selected}>
                    <TableCell>
                      <Checkbox
                        checked={selected}
                        onChange={() => handleToggle(envio)}
                        inputProps={{ "aria-label": `Seleccionar ${envio.id}` }}
                      />
                    </TableCell>

                    <TableCell>{envio.senderName || "-"}</TableCell>
                    <TableCell>{envio.venta || "-"}</TableCell>
                    <TableCell>{envio.recieverAddress || "-"}</TableCell>
                    <TableCell>{envio.localidad || "-"}</TableCell>
                    <TableCell>{envio.zona || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={estadoColor(envio.estado)}
                        variant="outlined"
                        label={envio.estado || "-"}
                        sx={{ textTransform: "none" }}
                      />
                    </TableCell>
                    <TableCell>{formatFecha(envio.creado)}</TableCell>

                    <TableCell align="center">
                      <Tooltip title="Imprimir etiqueta">
                        <IconButton color="default" size="small" onClick={() => imprimirEtiqueta(envio)}>
                          <Print fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Editar">
                        <span>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => setEnvioAEditar(envio)}
                            disabled={envio.estado === "Cancelado" || envio.estado === "Entregado"}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <span>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => setEnvioAEliminar(envio)}
                            disabled={envio.estado === "Cancelado"}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Detalle">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => {
                            setEnvioDetalle(envio);
                            setVerDetalleAbierto(true);
                          }}
                        >
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No se encontraron envíos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filtrados.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          rowsPerPageOptions={[10, 25, 50]}
        />

        {/* Modales */}
        <ModalEliminarEnvio envio={envioAEliminar} onClose={handleCerrarEliminar} />
        <ModalDetalleEnvio
          envio={envioDetalle}
          abierto={verDetalleAbierto}
          onCerrar={() => setVerDetalleAbierto(false)}
        />
        <ModalEditarEnvio envio={envioAEditar} open={!!envioAEditar} onClose={handleCerrarEditar} />
      </Paper>
    </LocalizationProvider>
  );
}
