import React, { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import { Edit, Delete, Info } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ModalEliminarEnvio from "./ModalEliminarEnvio";
import ModalDetalleEnvio from "./ModalDetalleEnvio";
import ModalEditarEnvio from "./ModalEditarEnvio";


  

export default function TablaAdmin({ envios, onEditar
  , onSeleccionar, enviosSeleccionados , onUpdate }) {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [filtrados, setFiltrados] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [seleccionados, setSeleccionados] = useState([]);
const [envioAEliminar, setEnvioAEliminar] = useState(null);
const [verDetalleAbierto, setVerDetalleAbierto] = useState(false);
const [envioDetalle, setEnvioDetalle] = useState(null);
const [filtroEstado, setFiltroEstado] = useState("");
const [envioAEditar, setEnvioAEditar] = useState(null);


  useEffect(() => {
    let nuevos = [...envios];

    if (fechaDesde) {
      const d = new Date(fechaDesde);
      nuevos = nuevos.filter((e) => e.creado?.toDate?.() >= d);
    }

    if (fechaHasta) {
      const h = new Date(fechaHasta);
      nuevos = nuevos.filter((e) => e.creado?.toDate?.() <= h);
    }

    if (filtroTexto.trim()) {
      const t = filtroTexto.toLowerCase();
      nuevos = nuevos.filter(
        (e) =>
          e.recieverAddress?.toLowerCase().includes(t) ||
          e.localidad?.toLowerCase().includes(t) ||
          e.zona?.toLowerCase().includes(t) ||
          e.estado?.toLowerCase().includes(t) ||
          e.motoName?.toLowerCase().includes(t)
      );
    }
     if (filtroEstado) {
    nuevos = nuevos.filter((e) => e.estado === filtroEstado);
  }
 
    setFiltrados(nuevos.sort((a, b) => {
  const fechaA = a.creado?.toDate?.() || new Date(0);
  const fechaB = b.creado?.toDate?.() || new Date(0);
  return fechaB - fechaA; // Descendente: más reciente primero
}));
    setPage(0); // reset page when filters change
    setSeleccionados(enviosSeleccionados)
  }, [envios, fechaDesde, fechaHasta, filtroTexto,filtroEstado]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginados = filtrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const formatFecha = (timestamp) => {
    try {
      return timestamp?.toDate
        ? new Intl.DateTimeFormat('es-AR').format(timestamp.toDate())
        : '-';
    } catch {
      return '-';
    }
  };

// Dentro del componente
const handleToggle = (envio) => {
  setSeleccionados((prev) =>
    prev.some((e) => e.id === envio.id)
      ? prev.filter((e) => e.id !== envio.id)
      : [...prev, envio]
  );
};

const toggleSeleccionTodos = (checked) => {
  setSeleccionados((prev) => {
    const nuevos = paginados.filter(
      (envio) => !prev.some((s) => s.id === envio.id)
    );
    return checked
      ? [...prev, ...nuevos]
      : prev.filter((e) => !paginados.some((p) => p.id === e.id));
  });
};

const estaSeleccionado = (id) => seleccionados.some((e) => e.id === id);
const todosSeleccionadosPagina = paginados.every((e) =>
  seleccionados.some((s) => s.id === e.id)
);

useEffect(() => {
  const idsSeleccionados = seleccionados.map((e) => e.id);
  onSeleccionar?.(idsSeleccionados);
}, [seleccionados]);

const handleCerrarEliminar = () => {
  setEnvioAEliminar(null);
  onUpdate?.(); // Refrescar tabla
   // ya tenés esta función para recargar los envíos
};
const handleCerrarEditar = () => {
  setEnvioAEditar(null);
  onUpdate?.(); // Refrescar tabla
   // ya tenés esta función para recargar los envíos
};
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
        {/* Filtros */}
        <Box sx={{ border: '1px  #ccc', borderRadius: 1, p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Buscar por texto"
              size="small"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              sx={{ width: 200 }}
            />
            <DatePicker
              label="Desde"
              value={fechaDesde}
              onChange={setFechaDesde}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
            />
            <DatePicker
              label="Hasta"
              value={fechaHasta}
              onChange={setFechaHasta}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
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
          </Stack>
        </Box>
{seleccionados.length > 0 && (
  <Typography variant="subtitle2" sx={{ mb: 1 }}>
    {seleccionados.length} envío{seleccionados.length !== 1 ? 's' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
  </Typography>
)}

        {/* Tabla */}
        <TableContainer sx={{ maxHeight: 500 }} >
          <Table stickyHeader >
            <TableHead>
  <TableRow style={{  bgcolor: 'grey.100' }}>
    <TableCell sx={{ bgcolor: 'grey.100' }} >
      <input
        type="checkbox"
        checked={paginados.length > 0 && todosSeleccionadosPagina}
        onChange={(e) => toggleSeleccionTodos(e.target.checked)}
        
      />
    </TableCell>
     <TableCell sx={{ bgcolor: 'grey.100' }}>Remitente</TableCell>
    <TableCell sx={{ bgcolor: 'grey.100' }}>Dirección</TableCell>
    <TableCell sx={{ bgcolor: 'grey.200' }}>Localidad</TableCell>
    <TableCell sx={{ bgcolor: 'grey.200' }}>Zona</TableCell>
    <TableCell sx={{ bgcolor: 'grey.200' }}>Estado</TableCell>
    <TableCell sx={{ bgcolor: 'grey.200' }}>Fecha</TableCell>
    <TableCell sx={{ bgcolor: 'grey.200' }}>Repartidor</TableCell>
    <TableCell sx={{ bgcolor: 'grey.200' }} align="center">Acciones</TableCell>
  </TableRow>
</TableHead>
            <TableBody>
  {paginados.map((envio) => (
    <TableRow key={envio.id || envio.numeroEnvio} hover selected={estaSeleccionado(envio.id)}>
      <TableCell >
        <input
          type="checkbox"
          checked={estaSeleccionado(envio.id)}
         onChange={() => handleToggle(envio)}
        />
      </TableCell>
      <TableCell>{envio.senderName || '-'}</TableCell>
      <TableCell>{envio.recieverAddress || '-'}</TableCell>
      <TableCell>{envio.localidad || '-'}</TableCell>
      <TableCell>{envio.zona || '-'}</TableCell>
      <TableCell>{envio.estado || '-'}</TableCell>
      <TableCell>{formatFecha(envio.creado)}</TableCell>
      <TableCell>{envio.motoName || '-'}</TableCell>
      <TableCell align="center">
        <IconButton color="primary" size="small" onClick={() => setEnvioAEditar?.(envio)} disabled={envio.estado === "Cancelado" || envio.estado === "Entregado"}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton color="error" size="small" onClick={() => setEnvioAEliminar?.(envio)}  disabled={envio.estado === "Cancelado"}>
          <Delete fontSize="small" />
        </IconButton>
        <IconButton color="info" size="small" onClick={() => {
        setEnvioDetalle(envio);
        setVerDetalleAbierto(true);
      }}>
          <Info fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}
              {paginados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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

        <ModalEliminarEnvio
  envio={envioAEliminar}
  onClose={handleCerrarEliminar}

/>
<ModalDetalleEnvio
  envio={envioDetalle}
  abierto={verDetalleAbierto}
  onCerrar={() => setVerDetalleAbierto(false)}
/>
<ModalEditarEnvio
  envio={envioAEditar}
  open={!!envioAEditar}
  onClose={handleCerrarEditar}
  
/>

      </Paper>
    </LocalizationProvider>
  );
}
