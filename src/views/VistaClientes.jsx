import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
} from "@mui/material";
import { getClients } from "../utils/getClients";

export default function VistaClientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClients();
        setClientes(data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter((c) =>
    [c.nombre, c.email].some((campo) =>
      campo?.toLowerCase().includes(filtro.toLowerCase())
    )
  );

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginados = clientesFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        👥 Clientes
      </Typography>

      <TextField
        label="Buscar cliente"
        variant="outlined"
        fullWidth
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Cuenta Corriente</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginados.map((cliente) => (
              <TableRow
                key={cliente.uid}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
              >
                <TableCell>{cliente.nombre || "-"}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>{cliente.telefono || "-"}</TableCell>
                <TableCell>{cliente.cuentaCorriente}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

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