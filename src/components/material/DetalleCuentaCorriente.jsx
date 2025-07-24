import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from "@mui/material";
import TablaPagosCliente from "./TablaPagosClientes";
import { getPagosByClient } from "../../utils/getPagos";

export default function DetalleCuentaCorriente({ open, onClose, cliente }) {
  const [pagosDetalle, setPagosDetalle] = useState([]);

  useEffect(() => {
    const fetchPagos = async () => {
      if (!cliente?.id) return;
      const pagos = await getPagosByClient(cliente.id);
      const pagosCuenta = pagos.filter((p) => p.metodo === "cuenta_corriente");
      setPagosDetalle(pagosCuenta);
    };
    fetchPagos();
  }, [cliente]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalle de Cuenta Corriente</DialogTitle>
      <DialogContent>
        <Typography mb={2}>
          Cliente: <strong>{cliente?.nombre || cliente?.email}</strong>
        </Typography>
        <Typography mb={2}>
          Balance actual: <strong>${cliente?.cuentaCorriente?.toLocaleString("es-AR")}</strong>
        </Typography>
        <TablaPagosCliente pagos={pagosDetalle} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}