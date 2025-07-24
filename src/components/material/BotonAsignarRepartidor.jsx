import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { doc, updateDoc, collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../../firebase";
import registrarCambioEstado from "../../utils/registrarCambioEstado";
import { useSnackbar } from "notistack";

export default function BotonAsignarRepartidorM({ enviosSeleccionados, setSeleccionados, envios, onActualizar }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [motos, setMotos] = useState([]);
  const [motoSeleccionada, setMotoSeleccionada] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const puedeAsignarRepartidor = envios
    .filter((e) => enviosSeleccionados.includes(e.id))
  .every((e) => e.estado === "Pendiente")

  useEffect(() => {
    const fetchMotos = async () => {
      try {
        const q = query(collection(db, "usuarios"), where("role", "==", "moto"));
        const querySnapshot = await getDocs(q);
        const motosData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMotos(motosData);
      } catch (error) {
        console.error("Error cargando motos:", error);
      }
    };

    if (modalOpen) fetchMotos();
  }, [modalOpen]);

  const abrirModal = () => {
    if (enviosSeleccionados.length === 0) return;
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setMotoSeleccionada("");
    setModalOpen(false);
  };

  const asignarMoto = async () => {
    if (!motoSeleccionada) return;

    const moto = motos.find((m) => m.id === motoSeleccionada);
    if (!moto) return;

    try {
      const updates = enviosSeleccionados.map(async (envio) => {
  const envioRef = doc(db, "envios", envio.id);

  await updateDoc(envioRef, {
    motoId: motoSeleccionada,
    motoName: motos.find((m) => m.id === motoSeleccionada)?.email || "",
  });

  await registrarCambioEstado(envio.id, "En camino");
});

      await Promise.all(updates);
      enqueueSnackbar("Envíos asignados correctamente", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Error al asignar envíos", { variant: "error" });
      console.error(err);
    } finally {
      setSeleccionados([]);
      cerrarModal();
      onActualizar?.();
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={abrirModal}
        disabled={enviosSeleccionados.length === 0 || !puedeAsignarRepartidor}
      >
        Asignar repartidor
      </Button>

      <Dialog open={modalOpen} onClose={cerrarModal}>
        <DialogTitle>Asignar repartidor</DialogTitle>
        <DialogContent sx={{ minWidth: 300, mt: 1 }}>
          <TextField
            select
            label="Repartidor"
            fullWidth
            value={motoSeleccionada}
            onChange={(e) => setMotoSeleccionada(e.target.value)}
          >
            <MenuItem value="">Seleccionar moto</MenuItem>
            {motos.map((moto) => (
              <MenuItem key={moto.id} value={moto.id}>
                {moto.email}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal}>Cancelar</Button>
          <Button
            onClick={asignarMoto}
            variant="contained"
            disabled={!motoSeleccionada}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
