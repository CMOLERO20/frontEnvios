// src/components/material/TablaEnviosCliente.jsx
import { useMemo, useState } from "react";
import {
  Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody,
  Toolbar, TextField, MenuItem, IconButton, Tooltip, Chip, TablePagination, Box
} from "@mui/material";
import { Info, Print } from "@mui/icons-material";
import dayjs from "dayjs";
import { downloadEtiquetaPDF } from "../../utils/etiquetas";

const fmt = (v) => {
  const d = v?.toDate ? v.toDate() : (v ? new Date(v) : null);
  return d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—";
};

export default function TablaEnviosCliente({ envios = [], onVerDetalle }) {
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  const data = useMemo(() => {
    let arr = [...envios];
    if (filtroTexto.trim()) {
      const t = filtroTexto.toLowerCase();
      arr = arr.filter((e) =>
        [e.numeroEnvio, e.recieverName, e.recieverAddress, e.localidad, e.zona, e.estado]
          .some((x) => (x || "").toString().toLowerCase().includes(t))
      );
    }
    if (filtroEstado) {
      arr = arr.filter((e) => (e.estado || "").toLowerCase() === filtroEstado.toLowerCase());
    }
    arr.sort((a, b) => (b.creado?.toMillis?.() || 0) - (a.creado?.toMillis?.() || 0));
    return arr;
  }, [envios, filtroTexto, filtroEstado]);

  const paginados = useMemo(() => {
    const start = page * rpp;
    return data.slice(start, start + rpp);
  }, [data, page, rpp]);

  const estadoColor = (estado) => {
    const s = (estado || "").toLowerCase();
    if (s === "pendiente") return "warning";
    if (s === "en camino" || s === "yendo al domicilio") return "info";
    if (s === "entregado") return "success";
    if (s === "cancelado" || s === "demorado") return "error";
    return "default";
  };

  const imprimir = (e) => {
    const destinatario = {
      nombre: e.recieverName,
      direccion: e.recieverAddress,
      localidad: e.localidad,
      zona: e.zona,
      telefono: e.recieverPhone,
    };
    downloadEtiquetaPDF({
      numeroEnvio: e.numeroEnvio || e.id,
      remitenteNombre: e.senderName || "-",
      destinatario,
    });
  };

  return (
    <Paper sx={{ p: 1.5 }}>
      <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Buscar"
          size="small"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          sx={{ minWidth: 240 }}
          placeholder="Código, dirección, zona…"
        />
        <TextField
          label="Estado"
          select
          size="small"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          sx={{ minWidth: 160 }}
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
      </Toolbar>

      <TableContainer sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Destinatario</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dirección</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Localidad</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Zona</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginados.map((e) => (
              <TableRow key={e.id || e.numeroEnvio} hover>
                <TableCell>{e.numeroEnvio || e.id}</TableCell>
                <TableCell>{fmt(e.creado)}</TableCell>
                <TableCell>{e.recieverName || "-"}</TableCell>
                <TableCell>{e.recieverAddress || "-"}</TableCell>
                <TableCell>{e.localidad || "-"}</TableCell>
                <TableCell>{e.zona || "-"}</TableCell>
                <TableCell>
                  <Chip size="small" color={estadoColor(e.estado)} label={e.estado || "-"} />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalle">
                    <IconButton size="small" color="info" onClick={() => onVerDetalle?.(e)}>
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Imprimir etiqueta">
                    <IconButton size="small" onClick={() => imprimir(e)}>
                      <Print fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginados.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  Sin envíos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rpp}
        onRowsPerPageChange={(e) => { setRpp(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage="Filas por página"
      />
    </Paper>
  );
}
