// src/views/AsignarRepartidor.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Checkbox,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from "@mui/material";
import { getEnvios } from "../utils/getEnvios";
import dayjs from "dayjs";
import BotonAsignarRepartidorM from "../components/material/BotonAsignarRepartidor";

export default function AsignarRepartidor() {
  const [envios, setEnvios] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [zonaFiltro, setZonaFiltro] = useState("");
  const [orientacionFiltro, setOrientacionFiltro] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchEnvios = async () => {
    const todos = await getEnvios();
    const pendientes = todos
      .filter((e) => e.estado === "Pendiente")
      .sort((a, b) => {
        if ((a.zona || "") === (b.zona || "")) {
          return (a.orientacion || "").localeCompare(b.orientacion || "");
        }
        return (a.zona || "").localeCompare(b.zona || "");
      });
    setEnvios(pendientes);
  };

  useEffect(() => {
    fetchEnvios();
  }, []);

  const handleToggle = (envio) => {
    setSeleccionados((prev) =>
      prev.some((e) => e.id === envio.id)
        ? prev.filter((e) => e.id !== envio.id)
        : [...prev, envio]
    );
  };

  const handleToggleAll = (checked, paginaActual) => {
    const paginaEnvios = filtrados.slice(paginaActual * rowsPerPage, paginaActual * rowsPerPage + rowsPerPage);
    const nuevos = paginaEnvios.filter((e) => !seleccionados.some((s) => s.id === e.id));
    if (checked) {
      setSeleccionados((prev) => [...prev, ...nuevos]);
    } else {
      setSeleccionados((prev) => prev.filter((e) => !paginaEnvios.some((p) => p.id === e.id)));
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const zonas = [...new Set(envios.map((e) => e.zona).filter(Boolean))];
  const orientaciones = [...new Set(envios.map((e) => e.orientacion).filter(Boolean))];

  const filtrados = envios.filter((e) => {
    return (
      (!zonaFiltro || e.zona === zonaFiltro) &&
      (!orientacionFiltro || e.orientacion === orientacionFiltro)
    );
  });

  const paginaActual = filtrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const todosSeleccionados = paginaActual.every((e) => seleccionados.some((s) => s.id === e.id));

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🛵 Asignar Repartidor
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2} alignItems="flex-end">
        <FormControl fullWidth>
          <InputLabel>Zona</InputLabel>
          <Select
            value={zonaFiltro}
            label="Zona"
            onChange={(e) => setZonaFiltro(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {zonas.map((zona) => (
              <MenuItem key={zona} value={zona}>{zona}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Orientación</InputLabel>
          <Select
            value={orientacionFiltro}
            label="Orientación"
            onChange={(e) => setOrientacionFiltro(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {orientaciones.map((o) => (
              <MenuItem key={o} value={o}>{o}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box display="flex" alignItems="center">
          <BotonAsignarRepartidorM
            enviosSeleccionados={seleccionados}
            setSeleccionados={setSeleccionados}
            envios={filtrados}
            onActualizar={fetchEnvios}
          />
        </Box>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={1}>
        {seleccionados.length} envío(s) seleccionado(s)
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={paginaActual.length > 0 && todosSeleccionados}
                  onChange={(e) => handleToggleAll(e.target.checked, page)}
                />
              </TableCell>
              <TableCell>Domicilio</TableCell>
              <TableCell>Localidad</TableCell>
              <TableCell>Zona</TableCell>
              <TableCell>Orientación</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginaActual.map((envio) => (
              <TableRow key={envio.id}>
                <TableCell>
                  <Checkbox
                    checked={seleccionados.some((e) => e.id === envio.id)}
                    onChange={() => handleToggle(envio)}
                  />
                </TableCell>
                <TableCell>{envio.recieverAddress}</TableCell>
                <TableCell>{envio.localidad}</TableCell>
                <TableCell>{envio.zona}</TableCell>
                <TableCell>{envio.orientacion || "-"}</TableCell>
                <TableCell>
                  {envio.creado?.toDate
                    ? dayjs(envio.creado.toDate()).format("DD/MM/YYYY")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={filtrados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Box mt={2} textAlign="right">
        <Typography variant="body2" color="text.secondary">
          {seleccionados.length} envío(s) seleccionado(s)
        </Typography>
      </Box>
    </Container>
  );
}
