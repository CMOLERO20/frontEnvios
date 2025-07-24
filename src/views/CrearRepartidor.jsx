import { useNavigate } from "react-router-dom";
import { Paper, Typography, Container } from "@mui/material";
import  CrearRepartidorForm from "../components/material/CrearRepartidorForm";

export default function CrearRepartidor() {
  const navigate = useNavigate();

  const handleExito = () => {
    navigate("/admin/clientes");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Crear Repartidor
        </Typography>
        <CrearRepartidorForm onExito={handleExito} />
      </Paper>
    </Container>
  );
}