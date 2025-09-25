import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Grid, TextField, MenuItem, Button, CircularProgress
} from "@mui/material";
import { useSnackbar } from "notistack";

import { ROLES } from "../../constants/roles";
import {
  createUser,
  updateUserById,
  isEmailTaken,
  toEmailLower,
  normalizePhone
} from "../../utils/users";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function UsuarioDialog({ open, onClose, modo = "crear", usuario = null }) {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    role: "client",
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const editMode = modo === "editar";

  useEffect(() => {
    if (!open) return;
    if (editMode && usuario) {
      setForm({
        nombre: usuario.nombre || "",
        email: usuario.email || "",
        telefono: usuario.telefono || "",
        role: (usuario.role || "client"),
        activo: usuario.activo !== false,
      });
    } else {
      setForm({ nombre: "", email: "", telefono: "", role: "client", activo: true });
    }
  }, [open, editMode, usuario]);

  const validar = () => {
    if (!form.nombre.trim() || form.nombre.trim().length < 3) return "Ingresá un nombre válido.";
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) return "Ingresá un email válido.";
    const telDigits = (form.telefono || "").replace(/\D/g, "");
    if (!telDigits || telDigits.length < 8) return "Ingresá un teléfono válido.";
    if (!ROLES.includes(form.role)) return "Rol inválido.";
    return null;
  };

  const guardar = async () => {
    const err = validar();
    if (err) { enqueueSnackbar(err, { variant: "warning" }); return; }

    setLoading(true);
    try {
      const emailLower = toEmailLower(form.email);

      if (editMode) {
        const cambioEmail = emailLower !== (usuario?.emailLower || (usuario?.email || "").toLowerCase());
        if (cambioEmail && (await isEmailTaken(emailLower, usuario.id))) {
          enqueueSnackbar("Ya existe un usuario con ese email.", { variant: "error" });
          setLoading(false);
          return;
        }
        await updateUserById(usuario.id, {
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          telefono: normalizePhone(form.telefono),
          role: form.role,
          activo: !!form.activo,
        });
        enqueueSnackbar("Usuario actualizado ✅", { variant: "success" });
      } else {
        if (await isEmailTaken(emailLower)) {
          enqueueSnackbar("Ya existe un usuario con ese email.", { variant: "error" });
          setLoading(false);
          return;
        }
        await createUser({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          telefono: normalizePhone(form.telefono),
          role: form.role,
          activo: !!form.activo,
        });
        enqueueSnackbar("Usuario creado ✅", { variant: "success" });
      }

      onClose?.(true);
    } catch (e) {
      console.error(e);
      enqueueSnackbar("No se pudo guardar el usuario.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : () => onClose?.(false)} fullWidth maxWidth="sm">
      <DialogTitle>{editMode ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
      <Divider />
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={7}>
            <TextField
              label="Nombre"
              fullWidth
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              autoFocus
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Rol"
              select
              fullWidth
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={7}>
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Teléfono"
              fullWidth
              value={form.telefono}
              onChange={(e) =>
                setForm((p) => ({ ...p, telefono: e.target.value.replace(/[^\d\s()+-]/g, "") }))
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Estado"
              select
              fullWidth
              value={form.activo ? "activo" : "inactivo"}
              onChange={(e) => setForm((p) => ({ ...p, activo: e.target.value === "activo" }))}
            >
              <MenuItem value="activo">activo</MenuItem>
              <MenuItem value="inactivo">inactivo</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={() => onClose?.(false)}>Cancelar</Button>
        <Button variant="contained" onClick={guardar} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : null}>
          {editMode ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
