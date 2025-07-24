import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField
} from "@mui/material";
import { getEnvios } from "../../utils/getEnvios";
import { useSnackbar } from "notistack";
import { registrarActivoCuentaCorriente } from "../../utils/registrarActivoCuentaCorriente";

export default function RegistrarPagoCuentaCorriente({ open, onClose, cliente }) {
  const [envios, setEnvios] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchEnvios = async () => {
      if (!cliente?.id) return;

      const todos = await getEnvios();
      const filtrados = todos.filter(
        (e) =>
          e.senderId === cliente.id &&
          e.metodoPago === "cuenta_corriente" &&
          e.estadoPago === "pendiente"
      );
      setEnvios(filtrados);
      setSeleccionados([]);
    };

    fetchEnvios();
  }, [cliente]);

  const handleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const total = seleccionados.reduce((acc, id) => {
    const envio = envios.find((e) => e.id === id);
    return acc + (envio?.precio || 0);
  }, 0);

  const handleRegistrar = async () => {
    try {
      await registrarActivoCuentaCorriente({
        clienteId: cliente.id,
        clienteNombre: cliente?.nombre || cliente?.email,
        monto: total,
        envios: seleccionados,
        creadoPor: "admin"
      });
      enqueueSnackbar("Pago registrado con éxito", { variant: "success" });
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error al registrar el pago", { variant: "error" });
    }
  };

  // Filtro por fecha
  const desde = fechaDesde ? new Date(fechaDesde) : null;
  const hasta = fechaHasta ? new Date(fechaHasta + "T23:59:59") : null;

  const enviosFiltrados = envios.filter((e) => {
    const fecha = e.creado?.toDate?.() || new Date(e.creado);
    if (desde && fecha < desde) return false;
    if (hasta && fecha > hasta) return false;
    return true;
  });

  const todosSeleccionados = seleccionados.length === enviosFiltrados.length;

  const toggleSeleccionarTodos = () => {
    if (todosSeleccionados) {
      setSeleccionados([]);
    } else {
      setSeleccionados(enviosFiltrados.map((e) => e.id));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Registrar Pago por Cuenta Corriente</DialogTitle>
      <DialogContent>
        <Typography mb={2}>
          Cliente: <strong>{cliente.nombre || cliente.email}</strong>
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Desde"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Hasta"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            size="small"
            fullWidth
          />
        </Box>

        {enviosFiltrados.length > 0 ? (
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={todosSeleccionados}
                      onChange={toggleSeleccionarTodos}
                    />
                  </TableCell>
                  <TableCell>Destinatario</TableCell>
                  <TableCell>Domicilio</TableCell>
                  <TableCell>Localidad</TableCell>
                  <TableCell>Precio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enviosFiltrados.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={seleccionados.includes(e.id)}
                        onChange={() => handleSeleccion(e.id)}
                      />
                    </TableCell>
                    <TableCell>{e.recieverName}</TableCell>
                    <TableCell>{e.recieverAddress}</TableCell>
                    <TableCell>{e.localidad}</TableCell>
                    <TableCell>${e.precio}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary">No hay envíos pendientes.</Typography>
        )}

        <Box mt={2}>
          <Typography variant="subtitle1">
            Total: <strong>${total.toLocaleString("es-AR")}</strong> —{" "}
            {seleccionados.length} envíos seleccionados
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleRegistrar}
          disabled={seleccionados.length === 0}
          variant="contained"
        >
          Registrar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
}
