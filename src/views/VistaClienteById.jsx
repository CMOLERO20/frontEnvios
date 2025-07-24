import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClient } from "../utils/getClients";
import { getEnviosById } from "../utils/getEnvios";
import { getPagosByClient } from "../utils/getPagos";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TablaEnviosCliente from "../components/material/TablaEnviosCliente";
import TablaPagosCliente from "../components/material/TablaPagosClientes";

export default function VistaClienteById() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [envios, setEnvios] = useState([]);
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const clienteSnap = await getClient(id);
      setCliente(clienteSnap);

      const enviosSnap = await getEnviosById(id);
      setEnvios(enviosSnap);

      const pagosSnap = await getPagosByClient(id);
      setPagos(pagosSnap);
    };

    fetchData();
  }, [id]);

  const totalEnvios = envios.length;
  const demorados = envios.filter((e) => e.estado === "Demorado").length;
  const porcentajeDemorados = totalEnvios ? Math.round((demorados / totalEnvios) * 100) : 0;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box mb={2}>
        <Tooltip title="Volver">
          <IconButton onClick={() => navigate("/admin/clientes")}> 
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        👤 Cliente: {cliente?.nombre || cliente?.email}
      </Typography>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={6}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Total de Envíos
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {totalEnvios}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                % de Demorados
              </Typography>
              <Typography variant="h6" color="warning.main" fontWeight="bold">
                {porcentajeDemorados}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Estado de Cuenta Corriente
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${cliente?.cuentaCorriente?.toLocaleString("es-AR") || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          📦 Envíos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TablaEnviosCliente envios={envios} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          💰 Pagos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TablaPagosCliente pagos={pagos} />
      </Box>
    </Container>
  );
}
