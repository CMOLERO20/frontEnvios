// ConfirmarPagosTransferencia.jsx
import { useEffect, useState } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText
} from "@mui/material";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";

export default function ConfirmarPagosTransferencia() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchPagos = async () => {
    setLoading(true);
    const q = query(
      collection(db, "pagos"),
      where("metodo", "==", "transferencia"),
      where("estado", "==", "pendiente")
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPagos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const confirmarPago = async () => {
    if (!pagoSeleccionado) return;

    await updateDoc(doc(db, "pagos", pagoSeleccionado.id), {
      estado: "Confirmado",
    });

    enqueueSnackbar("Pago confirmado correctamente", { variant: "success" });
    setPagoSeleccionado(null);
    fetchPagos();
  };

  return (
    
    <Box maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Confirmar Pagos por Transferencia
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Envíos</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagos.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.clienteNombre || "-"}</TableCell>
                <TableCell>${p.monto.toLocaleString("es-AR")}</TableCell>
                <TableCell>{p.creado?.toDate ? dayjs(p.creado.toDate()).format("DD/MM/YYYY") : "-"}</TableCell>
                <TableCell>{p.envios?.length || 0}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => setPagoSeleccionado(p)}
                  >
                    Confirmar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pagos.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay pagos pendientes.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de confirmación */}
      <Dialog open={!!pagoSeleccionado} onClose={() => setPagoSeleccionado(null)}>
        <DialogTitle>Confirmar pago</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que querés confirmar el pago de <strong>${pagoSeleccionado?.monto?.toLocaleString("es-AR")}</strong> de <strong>{pagoSeleccionado?.clienteNombre}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPagoSeleccionado(null)}>Cancelar</Button>
          <Button onClick={confirmarPago} variant="contained" color="success">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
