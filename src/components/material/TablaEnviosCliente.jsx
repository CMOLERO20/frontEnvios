import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  MenuItem,
  Box,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function TablaEnviosCliente({ envios }) {
  const [pagina, setPagina] = useState(0);
  const [filtrados, setFiltrados] = useState([]);
  const [estado, setEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const filasPorPagina = 25;

  useEffect(() => {
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta + "T23:59:59") : null;

    const nuevosFiltrados = envios.filter((envio) => {
      const fecha = envio.creado?.toDate?.() || new Date(envio.creado);
      if (estado && envio.estado !== estado) return false;
      if (desde && fecha < desde) return false;
      if (hasta && fecha > hasta) return false;
      return true;
    });

    setFiltrados(nuevosFiltrados);
    setPagina(0);
  }, [envios, estado, fechaDesde, fechaHasta]);

  const handleChangePage = (_, nuevaPagina) => {
    setPagina(nuevaPagina);
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          select
          label="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="Pendiente">Pendiente</MenuItem>
          <MenuItem value="En camino">En camino</MenuItem>
          <MenuItem value="Yendo al domicilio">Yendo al domicilio</MenuItem>
          <MenuItem value="Entregado">Entregado</MenuItem>
          <MenuItem value="Demorado">Demorado</MenuItem>
        </TextField>
        <TextField
          label="Desde"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
        />
        <TextField
          label="Hasta"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Domicilio</TableCell>
              <TableCell>Localidad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrados
              .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
              .map((envio) => (
                <TableRow key={envio.id}>
                  <TableCell>{envio.recieverAddress}</TableCell>
                  <TableCell>{envio.localidad}</TableCell>
                  <TableCell>{envio.estado}</TableCell>
                  <TableCell>
                    {envio.creado?.toDate
                      ? dayjs(envio.creado.toDate()).format("DD/MM/YYYY")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtrados.length}
        page={pagina}
        onPageChange={handleChangePage}
        rowsPerPage={filasPorPagina}
        rowsPerPageOptions={[]}
      />

      {filtrados.length === 0 && (
        <Typography variant="body2" color="text.secondary" mt={2}>
          No hay envíos que coincidan con los filtros.
        </Typography>
      )}
    </Box>
  );
}
