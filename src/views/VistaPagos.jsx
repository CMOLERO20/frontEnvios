import { useEffect, useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import TablaPagosCliente from "../components/material/TablaPagosClientes";
import { getPagos } from "../utils/getPagos";

export default function VistaPagos() {
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const data = await getPagos();
        setPagos(data);
      } catch (error) {
        console.error("Error al obtener pagos:", error);
      }
    };
    fetchPagos();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        💰 Ver Pagos
      </Typography>
      <Box sx={{ mt: 4 }}>
        <TablaPagosCliente pagos={pagos} />
      </Box>
    </Container>
  );
}
