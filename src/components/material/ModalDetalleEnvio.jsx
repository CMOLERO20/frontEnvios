import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, storage } from "../../firebase";
import formatearFecha from "../../utils/formatearFecha";


export default function ModalDetalleEnvio({ envio, abierto, onCerrar }) {
  console.log("🚀 ~ ModalDetalleEnvio ~ envio:", envio)
  const [historial, setHistorial] = useState([]);
  const [fotoURL, setFotoURL] = useState(null);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [cargandoFoto, setCargandoFoto] = useState(false);

  useEffect(() => {
    if (!envio?.id || !abierto) return;

    const cargarHistorial = async () => {
      setCargandoHistorial(true);
      try {
       const ref = collection(db, "envios", envio.id, "historial");
      const snap = await getDocs(ref);
      const datos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        setHistorial( datos.sort((a, b) => b.fecha?.seconds - a.fecha?.seconds));
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setCargandoHistorial(false);
      }
    };

    const cargarFoto = async () => {
  setCargandoFoto(true);
  try {
    if (envio.fotoUrl) {
      console.log("Cargando foto:", envio.fotoUrl);
      setFotoURL(envio.fotoUrl);
    } else {
      console.warn("No hay URL de foto");
    }
  } catch (error) {
    console.error("Error al cargar la imagen:", error);
  } finally {
    setCargandoFoto(false);
  }
};
    cargarHistorial();
    cargarFoto();
  }, [envio, abierto]);

  if (!envio) return null;

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="md">
      <DialogTitle>Detalle del Envío {envio.numeroEnvio || ""}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Campo label="Venta" valor={envio.venta || '-'} />
          <Campo label="Estado" valor={envio.estado} />
          <Campo label="Destinatario" valor={envio.recieverName} />
          <Campo label="Dirección" valor={envio.recieverAddress} />
          <Campo label="Localidad" valor={envio.localidad} />
          <Campo label="Zona" valor={envio.zona} />
          <Campo label="Teléfono" valor={envio.recieverPhone} />
          <Campo label="Fecha de creación" valor={formatearFecha(envio.creado)} />
          <Campo label="Remitente" valor={envio.senderName} />
          <Campo label="Repartidor" valor={envio.motoName || "Sin asignar"} />
          <Campo label="Método de pago" valor={envio.metodoPago || "-"} />
          <Campo label="Precio" valor={envio.precio != null ? `$${envio.precio}` : "-"} />
        </Grid>

         <Divider className="my-4" />
        <Typography variant="h6">Historial de Estados</Typography>
        {cargandoHistorial ? (
          <CircularProgress size={24} />
        ) : historial.length === 0 ? (
          <Typography variant="body2" color="textSecondary">Sin historial disponible</Typography>
        ) : (
          <ul className="mt-2">
            {historial.map((h, idx) => (
              <li key={idx}>
                <Typography variant="body2">
                  <strong>{h.fecha?.toDate().toLocaleString("es-AR", {
                dateStyle: "short",
                timeStyle: "short",
              })}</strong> 
              <strong>{h.creado?.toDate().toLocaleString("es-AR", {
                dateStyle: "short",
                timeStyle: "short",
              })}</strong>{h.estado}
                  {h.usuario && ` por ${h.usuario}`}
                </Typography>
              </li>
            ))}
          </ul>
        )}
        <Divider className="my-4" />
        <Typography variant="h6">Etiqueta del Envío</Typography>
        {cargandoFoto ? (
          <CircularProgress size={24} />
        ) : fotoURL ? (
          <img
            src={fotoURL}
            alt="Etiqueta del envío"
            className="mt-2 rounded shadow"
            style={{ maxWidth: "100%", maxHeight: 400 }}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">Sin imagen disponible</Typography>
        )}

       
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar} color="primary">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

function Campo({ label, valor }) {
  return (
    <Grid item xs={6}>
      <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
      <Typography>{valor || "-"}</Typography>
    </Grid>
  );
}
