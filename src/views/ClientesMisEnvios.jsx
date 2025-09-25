// src/views/ClienteMisEnvios.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Stack,
  Box,
  Collapse,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { useAuth } from "../context/AuthProvider";
import { listenEnviosBySender } from "../utils/envios";
import TablaEnviosCliente from "../components/material/TablaEnviosViewCliente";
import ModalDetalleEnvioCliente from "../components/material/ModalDetalleEnvioCliente";
import CrearEnvioManual from "../components/material/CrearEnvioManual";

export default function ClienteMisEnvios() {
  const { user, loading } = useAuth();
  const [envios, setEnvios] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [mostrarCrear, setMostrarCrear] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenEnviosBySender(user.uid, setEnvios, console.error);
    return () => unsub?.();
  }, [user?.uid]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Mis envíos
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setMostrarCrear((v) => !v)}
        >
          {mostrarCrear ? "Ocultar formulario" : "Crear envío"}
        </Button>
      </Stack>

      <Collapse in={mostrarCrear} unmountOnExit>
        <Box sx={{ mb: 3 }}>
          {/* Si más adelante actualizás CrearEnvioManual para usar también useAuth,
              podés quitar la prop currentUser */}
          <CrearEnvioManual currentUser={user} />
        </Box>
      </Collapse>

      <TablaEnviosCliente envios={envios} onVerDetalle={(e) => setDetalle(e)} />

      <ModalDetalleEnvioCliente
        envio={detalle}
        open={!!detalle}
        onClose={() => setDetalle(null)}
      />
    </Container>
  );
}
