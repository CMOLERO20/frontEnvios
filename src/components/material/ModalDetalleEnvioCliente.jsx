// src/components/material/ModalDetalleEnvioCliente.jsx
import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Typography, Chip, Divider, Stack
} from "@mui/material";
import dayjs from "dayjs";
import { getHistorialEnvio } from "../../utils/envios";

const fmt = (v) => {
  const d = v?.toDate ? v.toDate() : (v ? new Date(v) : null);
  return d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—";
};

export default function ModalDetalleEnvioCliente({ envio, open, onClose }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!envio?.id) return setHistorial([]);
      const h = await getHistorialEnvio(envio.id);
      if (active) setHistorial(h);
    })();
    return () => { active = false; };
  }, [envio?.id]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalle del envío</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Código</Typography>
            <Typography>{envio?.numeroEnvio || envio?.id}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Estado</Typography>
            <Chip label={envio?.estado || "-"} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Fecha</Typography>
            <Typography>{fmt(envio?.creado)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Zona</Typography>
            <Typography>{envio?.zona || "-"}</Typography>
          </Grid>

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2">Destinatario</Typography>
            <Typography><b>{envio?.recieverName || "-"}</b></Typography>
            <Typography>{envio?.recieverAddress || "-"}</Typography>
            <Typography>{envio?.localidad || "-"}</Typography>
            {envio?.recieverPhone && <Typography>Tel: {envio.recieverPhone}</Typography>}
          </Grid>

          {envio?.notas && (
            <Grid item xs={12}>
              <Typography variant="subtitle2">Notas</Typography>
              <Typography>{envio.notas}</Typography>
            </Grid>
          )}

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Historial</Typography>
            {historial.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Sin movimientos.</Typography>
            ) : (
              <Stack spacing={0.5}>
                {historial.map((h) => (
                  <Typography key={h.id} variant="body2">
                    {fmt(h.creado)} — {h.estado}
                  </Typography>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
