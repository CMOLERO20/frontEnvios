
import { useState } from "react";
import {
  TextField,
  Button,
  Stack
} from "@mui/material";
import { registrarRepartidor } from "../../utils/registrarRepartidor";  
import { useSnackbar } from "notistack";

export default function CrearRepartidorForm({ onExito }) {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar(); // ✅ notistack
  const [errores, setErrores] = useState({});

  const validar = () => {
    const err = {};
    if (!formData.nombre.trim()) err.nombre = "El nombre es obligatorio";
    if (!/^\d{6,15}$/.test(formData.telefono)) err.telefono = "Teléfono inválido (solo números)";
    if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = "Email inválido";
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setLoading(true);
    try {
      await registrarRepartidor(formData); // crea usuario con password "123456"
      enqueueSnackbar("Repartidor creado correctamente", { variant: "success" }); // ✅
      onExito?.();
      setFormData({ nombre: "", telefono: "", email: "" });
    } catch (err) {
      enqueueSnackbar("Error al crear el cliente", { variant: "error" }); // ❌
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          name="nombre"
          label="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
          error={!!errores.nombre}
          helperText={errores.nombre}
        />
        <TextField
          name="telefono"
          label="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          required
          error={!!errores.telefono}
          helperText={errores.telefono}
        />
        <TextField
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          required
          error={!!errores.email}
          helperText={errores.email}
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Creando..." : "Crear Repartidor"}
        </Button>
      </Stack>
    </form>
  );
}