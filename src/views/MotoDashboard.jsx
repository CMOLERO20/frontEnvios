import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper
} from "@mui/material";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import { getEnviosPorRepartidor } from "../utils/getEnviosPorRepartidor";
import ContadorEnvios from "../components/ContadorEnvios";
import TarjetaEnvios from "../components/TarjetaEnvios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function MotoDashboard() {
  const [user, setUser] = useState(null);
  const [envios, setEnvios] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getEnviosPorRepartidor(user.uid, (data) => {
      const activos = data.filter((e) => e.activo === true);
      setEnvios(activos);
    });
    return () => unsubscribe();
  }, [user]);

  const activos = envios.filter((e) => e.activo);

  if (!user) return <p>Cargando...</p>;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Bienvenido, repartidor
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <ContadorEnvios
            envios={envios}
            estado={["En camino", "Yendo al domicilio", "Pendiente", "Demorado"]}
            titulo="Envíos activos"
          />
        </Grid>
        <Grid item xs={6}>
          <ContadorEnvios
            envios={envios}
            estado={[]}
            titulo="Demorados"
            color="text-red-600"
            flagDemorado={true}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Envíos activos
      </Typography>

      <Box mb={3}>
        {activos.length === 0 ? (
          <Typography color="text.secondary">No tenés envíos activos.</Typography>
        ) : (
          <TarjetaEnvios envios={activos} />
        )}
      </Box>

      <Paper
        elevation={2}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          ":hover": { backgroundColor: "#f9f9f9" }
        }}
      >
        <CheckCircleIcon color="success" />
        <Box>
          <Typography variant="subtitle1" fontWeight="medium">
            Envíos finalizados
          </Typography>
          <Button
            component={Link}
            to="/moto/finalizados"
            variant="text"
            size="small"
          >
            Ver Historial de Entregas
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}