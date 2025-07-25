import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { editarCliente } from "../../utils/editarCliente";

export default function EditarClienteModal({ cliente, open, onClose, onGuardado }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [hayCambios, setHayCambios] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Resetear los campos al abrir con un nuevo cliente
  useEffect(() => {
    if (cliente && open) {
      setNombre(cliente.nombre || "");
      setEmail(cliente.email || "");
      setTelefono(cliente.telefono || "");
    }
  }, [cliente, open]);

  // Detectar si hubo cambios respecto al cliente original
  useEffect(() => {
    if (!cliente) return;
    const cambios =
      nombre.trim() !== (cliente.nombre || "").trim() ||
      email.trim() !== (cliente.email || "").trim() ||
      telefono.trim() !== (cliente.telefono || "").trim();
    setHayCambios(cambios);
  }, [nombre, email, telefono, cliente]);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const datosActualizados = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
      };

      await editarCliente(cliente.uid, datosActualizados);
      console.log("🚀 ~ handleGuardar ~ cliente.id:", cliente.id)

     
        enqueueSnackbar("Cliente actualizado correctamente", { variant: "success" });
        if (onGuardado) onGuardado();
        onClose();
       
        
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      enqueueSnackbar("Error inesperado al guardar", { variant: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Cliente</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={guardando || !hayCambios}
          startIcon={guardando && <CircularProgress size={18} />}
        >
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
