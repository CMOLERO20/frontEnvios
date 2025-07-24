import { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Grid,
  TablePagination
} from "@mui/material";
import dayjs from "dayjs";

export default function TablaPagosCliente({ pagos }) {
  const [filtroEstado, setFiltroEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pagina, setPagina] = useState(0);
  const [filtrados, setFiltrados] = useState([]);
  const [filtroMetodo, setFiltroMetodo] = useState("");

  const pagosPorPagina = 25;

  useEffect(() => {
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta + "T23:59:59") : null;

    const resultado = pagos.filter((p) => {
      const fechaPago = p.creado?.toDate?.() || new Date(p.creado);
      if (desde && fechaPago < desde) return false;
      if (hasta && fechaPago > hasta) return false;
      if (filtroEstado && p.estado !== filtroEstado) return false;
      if (filtroMetodo && p.metodo !== filtroMetodo) return false;
      return true;
    }).sort((a, b) => {
      const fechaA = a.creado?.toDate?.() || new Date(a.creado);
      const fechaB = b.creado?.toDate?.() || new Date(b.creado);
      return fechaB - fechaA; // más reciente primero
    });

    setFiltrados(resultado);
    setPagina(0);
  }, [pagos, filtroEstado, fechaDesde, fechaHasta, filtroMetodo]);

  return (
    <Box>
      <Grid container spacing={2} mb={2}>
        
        <Grid item xs={6} sm={4}>
          <TextField
            label="Desde"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
             size="small"
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            label="Hasta"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
             size="small"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
  <TextField
    label="Método de Pago"
    select
    fullWidth
    value={filtroMetodo}
    onChange={(e) => setFiltroMetodo(e.target.value)}
     sx={{ minWidth: 160 }}
             size="small"
  >
    <MenuItem value="">Todos</MenuItem>
    <MenuItem value="transferencia">Transferencia</MenuItem>
    <MenuItem value="efectivo">Efectivo</MenuItem>
    <MenuItem value="cuenta_corriente">Cuenta Corriente</MenuItem>
  </TextField>
</Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Estado"
            select
            fullWidth
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            sx={{ minWidth: 160 }}
             size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Confirmado">Confirmado</MenuItem>
            <MenuItem value="Pendiente">Pendiente</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Método</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Envíos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrados
              .slice(pagina * pagosPorPagina, pagina * pagosPorPagina + pagosPorPagina)
              .map((pago) => (
                <TableRow key={pago.id}>
                  <TableCell>{pago.metodo}</TableCell>
                  <TableCell>${pago.monto.toLocaleString("es-AR")}</TableCell>
                   <TableCell>{pago.envios?.length || 0}</TableCell>
                  <TableCell>{pago.estado}</TableCell>
                  <TableCell>
                    {pago.creado?.toDate
                      ? dayjs(pago.creado.toDate()).format("DD/MM/YYYY")
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
        onPageChange={(e, nuevaPagina) => setPagina(nuevaPagina)}
        rowsPerPage={pagosPorPagina}
        rowsPerPageOptions={[pagosPorPagina]}
      />
    </Box>
  );
}
