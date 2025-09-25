// src/components/material/CrearClienteForm.jsx
import { useState, useMemo } from "react";
import {
  Card, CardContent, CardHeader, CardActions,
  Stack, Grid, TextField, Button, Divider,
  InputAdornment, Typography, Avatar, Tooltip, CircularProgress
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
// AJUSTAR RUTA SI HACE FALTA:

import { createCliente } from "../../utils/clientes";
const DEFAULT_REDIRECT = "/admin/clientes"; // ← destino después de crear

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function CrearClienteForm({ onCreated, onCancel }) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // ---- Validaciones
  const validar = (fd) => {
    const e = {};
    if (!fd.nombre?.trim() || fd.nombre.trim().length < 3) {
      e.nombre = "Ingresá al menos 3 caracteres.";
    }
    const telDigits = (fd.telefono || "").replace(/\D/g, "");
    if (!telDigits) {
      e.telefono = "Ingresá un teléfono.";
    } else if (telDigits.length < 8) {
      e.telefono = "El teléfono parece incompleto.";
    }
    if (!fd.email?.trim()) {
      e.email = "Ingresá un email.";
    } else if (!emailRegex.test(fd.email.trim())) {
      e.email = "Email inválido.";
    }
    return e;
  };

  const isValid = useMemo(() => {
    const e = validar(formData);
    return Object.keys(e).length === 0;
  }, [formData]);

  // ---- Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefono") {
      const digits = value.replace(/[^\d\s()+-]/g, "");
      setFormData((p) => ({ ...p, [name]: digits }));
      if (errores.telefono) setErrores((p) => ({ ...p, telefono: undefined }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
    if (errores[name]) setErrores((p) => ({ ...p, [name]: undefined }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const eNew = validar(formData);
    setErrores((prev) => ({ ...prev, [name]: eNew[name] }));
  };

  const handleReset = () => {
    setFormData({ nombre: "", telefono: "", email: "" });
    setErrores({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eNow = validar(formData);
    if (Object.keys(eNow).length > 0) {
      setErrores(eNow);
      return;
    }

    setLoading(true);
    try {
      await createCliente({
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim().toLowerCase(),
        role: "client", // ← SIN la "e"
      });

      enqueueSnackbar("Cliente creado correctamente ✅", { variant: "success" });
      onCreated?.();           // por si el padre quiere refrescar algo
      navigate(DEFAULT_REDIRECT, { replace: true }); // ← redirección automática
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err?.message || "No se pudo crear el cliente.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const avatarText = initials(formData.nombre);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44, fontWeight: 700 }}>
              {avatarText || "?"}
            </Avatar>
          }
          title={<Typography variant="h6" fontWeight={800}>Nuevo cliente</Typography>}
          subheader="Completá los datos básicos para registrarlo"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={!!errores.nombre}
                helperText={errores.nombre || "Ej.: Juan Pérez"}
                fullWidth
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="telefono"
                label="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={!!errores.telefono}
                helperText={errores.telefono || "Solo números, podés incluir espacios"}
                fullWidth
                inputMode="tel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalPhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={!!errores.email}
                helperText={errores.email || "Ej.: usuario@dominio.com"}
                fullWidth
                type="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "center" }}>
              <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                <Tooltip title="Borrar campos">
                  <span style={{ flex: 1 }}>
                    <Button
                      onClick={handleReset}
                      fullWidth
                      variant="outlined"
                      disabled={loading}
                    >
                      Limpiar
                    </Button>
                  </span>
                </Tooltip>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !isValid}
                  startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                  {loading ? "Creando..." : "Crear cliente"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          {onCancel && (
            <Button color="inherit" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          
        </CardActions>
      </Card>
    </form>
  );
}
