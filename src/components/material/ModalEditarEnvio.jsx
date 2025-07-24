import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Button
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useEffect, useState } from "react";
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useSnackbar } from 'notistack';

export default function ModalEditarEnvio({ envio, open, onClose, onUpdate }) {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del envío cuando el modal se abre o cambia
  useEffect(() => {
    if (envio) {
      const initial = {
        recieverName: envio.recieverName || "",
        recieverAddress: envio.recieverAddress || "",
        recieverPhone: envio.recieverPhone || ""
      };
      setFormData(initial);
      setOriginalData(initial);
    }
  }, [envio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      // Detectar cambios
      const cambios = {};
      for (const key in formData) {
        if (formData[key] !== originalData[key]) {
          cambios[key] = formData[key];
        }
      }

      if (Object.keys(cambios).length === 0) {
        enqueueSnackbar("No hiciste ningún cambio.", { variant: "info" });
        setLoading(false);
        return;
      }

      const envioRef = doc(db, "envios", envio.id);
      await updateDoc(envioRef, cambios);

      await addDoc(collection(envioRef, "historial"), {
        tipo: "Modificación",
        mensaje: `Se modificaron los campos: ${Object.keys(cambios).join(", ")}`,
        datosAnteriores: originalData,
        nuevosDatos: cambios,
        creado: serverTimestamp()
      });

      enqueueSnackbar("Envío actualizado correctamente ✅", { variant: "success" });
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error("Error al actualizar:", err);
      enqueueSnackbar("Hubo un error al guardar los cambios", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Modificar Envío</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Destinatario"
            name="recieverName"
            value={formData.recieverName || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Domicilio"
            name="recieverAddress"
            value={formData.recieverAddress || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Teléfono"
            name="recieverPhone"
            value={formData.recieverPhone || ""}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <LoadingButton
          onClick={handleGuardar}
          loading={loading}
          variant="contained"
        >
          Guardar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
