import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  CircularProgress,
  RadioGroup,
  FormLabel,
  Radio,
  Card,
  CardContent,
  Stack,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import obtenerPrecioPorZona from "../../utils/obtenerPrecioPorZona";
import localidades from "../../utils/localidades";
import { getClients } from "../../utils/getClients";
import { crearEnvios } from "../../utils/crearEnvio";
import { useSnackbar } from "notistack";

export default function CrearEnviosMultiples() {
  const [usuarios, setUsuarios] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [remitenteId, setRemitenteId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [envios, setEnvios] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [form, setForm] = useState({
    recieverName: "",
    recieverDni: "",
    recieverPhone: "",
    recieverAddress: "",
    localidad: "",
    zona: "",
    flex: false,
  });
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const cliente = await getClients();
        setUsuarios(cliente);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      zona: name === "localidad" ? localidades.find((l) => l.nombre === value)?.zona || "" : prev.zona,
    }));
  };

  const agregarEnvio = () => {
    if (!form.recieverName || !form.recieverAddress || !form.localidad || !form.zona) {
      return setMensaje({ tipo: "error", texto: "Faltan campos obligatorios." });
    }

    const nuevoEnvio = {
      ...form,
      precio: obtenerPrecioPorZona(form.zona),
    };

    setEnvios((prev) => [...prev, nuevoEnvio]);
    setForm({ recieverName: "", recieverDni: "", recieverPhone: "", recieverAddress: "", localidad: "", zona: "", flex: false });
  };

  const guardarEnvios = async () => {
    if (!remitenteId || envios.length === 0 || !metodoPago) {
      setMensaje({ tipo: "error", texto: "Seleccioná un remitente, cargá envíos y método de pago." });
      return;
    }

    try {
      setGuardando(true);
      await crearEnvios({ enviosOCR: envios, remitenteId, senderName, metodoPago });
      enqueueSnackbar("Envíos creados correctamente ✅", { variant: "success" });
      navigate("/admin");
    } catch (error) {
      console.error("Error al crear envíos:", error);
      setMensaje({ tipo: "error", texto: "Hubo un error al crear los envíos." });
    } finally {
      setGuardando(false);
    }
  };

  return (
    
    <Box maxWidth="md" mx="auto" p={2}>

      <Typography variant="h4" fontWeight="bold" gutterBottom>Crear Múltiples Envíos</Typography>

      {mensaje && (
        <Alert severity={mensaje.tipo === "error" ? "error" : "success"} sx={{ mb: 2 }}>{mensaje.texto}</Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
       
<Typography variant="h6" gutterBottom>Datos del Envío</Typography>
        <Grid container spacing={2} columns={12} mt={1}>
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}><TextField label="Destinatario" name="recieverName" fullWidth required value={form.recieverName} onChange={handleChange} /></Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}><TextField label="DNI" name="recieverDni" fullWidth value={form.recieverDni} onChange={handleChange} /></Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}><TextField label="Teléfono" name="recieverPhone" fullWidth value={form.recieverPhone} onChange={handleChange} /></Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}><TextField label="Domicilio*" name="recieverAddress" fullWidth required value={form.recieverAddress} onChange={handleChange} /></Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 9' } }}>
            <FormControl fullWidth required>
              <InputLabel>Localidad*</InputLabel>
              <Select
              sx={{ gridColumn: { width: '222px' } }}
                name="localidad"
                value={form.localidad}
                label="Localidad"
                onChange={(e) => {
                  const localidadSeleccionada = localidades.find((l) => l.nombre === e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    localidad: e.target.value,
                    zona: localidadSeleccionada?.zona || "",
                  }));
                }}
              >
                <MenuItem value="">Seleccionar</MenuItem>
                {localidades.map((l) => (
                  <MenuItem key={l.nombre} value={l.nombre}>{l.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}><TextField label="Zona" name="zona" fullWidth value={form.zona} InputProps={{ readOnly: true }} /></Grid>
        </Grid>

        <FormControlLabel
          control={<Checkbox checked={form.flex} onChange={(e) => setForm((prev) => ({ ...prev, flex: e.target.checked }))} />}
          label="Envío Flex"
        />

        {form.zona && (
          <Typography variant="body2" mt={1} mb={2}>Precio estimado: ${obtenerPrecioPorZona(form.zona).toLocaleString("es-AR")}</Typography>
        )}

        <Stack direction="row" spacing={2} mt={2}>
          <Button variant="contained" color="success" onClick={agregarEnvio}>Agregar Envío</Button>
          <Button variant="outlined" color="inherit" onClick={() => setForm({ recieverName: "", recieverDni: "", recieverPhone: "", recieverAddress: "", localidad: "", zona: "", flex: false })}>Limpiar</Button>
        </Stack>
      </Paper>

      {envios.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Envíos cargados ({envios.length})</Typography>
          <Typography variant="body2" mb={2}>Total: ${envios.reduce((sum, e) => sum + (e.precio || obtenerPrecioPorZona(e.zona)), 0).toLocaleString("es-AR")}</Typography>

 <FormControl fullWidth margin="normal" required error={!remitenteId}>
          <InputLabel>Remitente</InputLabel>
          <Select
            value={remitenteId}
            onChange={(e) => {
              const id = e.target.value;
              const usuario = usuarios.find((u) => u.uid === id);
              setRemitenteId(id);
              setSenderName(usuario?.nombre || "");
            }}
            label="Remitente"
          >
            <MenuItem value="">Seleccionar remitente</MenuItem>
            {usuarios.map((u) => (
              <MenuItem key={u.id} value={u.uid}>{u.nombre} ({u.email})</MenuItem>
            ))}
          </Select>
        </FormControl>
          <FormControl component="fieldset" sx={{ mb: 2 }} required error={!metodoPago}>
            <FormLabel component="legend">Método de Pago</FormLabel>
            <RadioGroup row value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              <FormControlLabel value="efectivo" control={<Radio />} label="Efectivo" />
              <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia" />
              <FormControlLabel value="cuenta_corriente" control={<Radio />} label="Cuenta Corriente" />
            </RadioGroup>
          </FormControl>

          {envios.map((e, i) => (
            <Card key={i} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2"><strong>{e.recieverName}</strong> </Typography>
                    <Typography variant="body2">{e.recieverAddress}, {e.localidad} ({e.zona})</Typography>
                  </Box>
                  <Button color="error" size="small" onClick={() => setEnvios((prev) => prev.filter((_, index) => index !== i))}>Eliminar</Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}

      <Box display="flex" gap={2}>
        <Button variant="contained" color="primary" onClick={guardarEnvios}>Crear Envíos</Button>
        <Button variant="outlined" onClick={() => navigate("/admin")}>Cancelar</Button>
      </Box>

      {guardando && <Box
    position="fixed"
    top={0}
    left={0}
    width="100vw"
    height="100vh"
    bgcolor="rgba(255,255,255,0.6)"
    display="flex"
    alignItems="center"
    justifyContent="center"
    zIndex={9999}
  >
    <CircularProgress size={80} />
  </Box>}
    </Box>
  );
}
