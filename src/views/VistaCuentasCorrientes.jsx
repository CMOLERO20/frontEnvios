import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import InfoIcon from "@mui/icons-material/Info";
import { getClients } from "../utils/getClients";
import RegistrarPagoCuentaCorriente from "../components/material/RegistrarPagoCuentaCorriente";
import DetalleCuentaCorriente from "../components/material/DetalleCuentaCorriente";

export default function VistaCuentasCorrientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [detalleCliente, setDetalleCliente] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      const data = await getClients();
      const conDeuda = data.filter((c) => c.cuentaCorriente > 0);
      setClientes(conDeuda);
    };
    fetchClientes();
  }, []);

  const filtrados = clientes.filter((c) =>
    (c.nombre || c.email).toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleAbrirPago = (cliente) => {
    setClienteSeleccionado(cliente);
    setOpenModal(true);
  };

  const handleCerrarPago = () => {
    setClienteSeleccionado(null);
    setOpenModal(false);
  };

  const handleAbrirDetalle = (cliente) => {
    setDetalleCliente(cliente);
  };

  const handleCerrarDetalle = () => {
    setDetalleCliente(null);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        🧾 Cuentas Corrientes
      </Typography>

      <TextField
        label="Buscar cliente"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ my: 2 }}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Cuenta Corriente</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrados.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nombre || "-"}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell align="right">
                  ${cliente.cuentaCorriente?.toLocaleString("es-AR")}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleAbrirPago(cliente)}
                    color="primary"
                  >
                    <PaymentIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleAbrirDetalle(cliente)}
                    color="info"
                  >
                    <InfoIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {clienteSeleccionado && (
        <RegistrarPagoCuentaCorriente
          open={openModal}
          onClose={handleCerrarPago}
          cliente={clienteSeleccionado}
        />
      )}

      {detalleCliente && (
        <DetalleCuentaCorriente
          open={Boolean(detalleCliente)}
          cliente={detalleCliente}
          onClose={handleCerrarDetalle}
        />
      )}
    </Container>
  );
}
