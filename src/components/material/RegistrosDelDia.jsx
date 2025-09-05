import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Toolbar,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { subscribeRegistrosPorDia, startOfDayTS } from "../../utils/registros.jsx";
import { eliminarRegistroYPagoById } from "../../utils/registros.jsx";

const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export default function RegistrosDelDia() {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [clienteId] = useState(""); // si luego querés filtro por cliente, enchufamos un Autocomplete
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // estado para eliminar
  const [openConfirm, setOpenConfirm] = useState(false);
  const [target, setTarget] = useState(null); // { id, clienteNombre, montoTotal, ... }
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const f = new Date(fecha);
    setErrorMsg("");
    const unsub = subscribeRegistrosPorDia(
      f,
      clienteId || undefined,
      (arr) => setItems(arr),
      (err) => setErrorMsg(err?.message || "Error al suscribirse a registros.")
    );
    return () => unsub();
  }, [fecha, clienteId]);

  const totales = useMemo(
    () =>
      items.reduce(
        (acc, r) => {
          acc.monto += r.montoTotal || 0;
          acc.CABA += r.cantidades?.CABA || 0;
          acc.Z1 += r.cantidades?.Z1 || 0;
          acc.Z2 += r.cantidades?.Z2 || 0;
          acc.Z3 += r.cantidades?.Z3 || 0;
          return acc;
        },
        { monto: 0, CABA: 0, Z1: 0, Z2: 0, Z3: 0 }
      ),
    [items]
  );

  const handleAskDelete = (row) => {
    setTarget(row);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    if (deleting) return;
    setOpenConfirm(false);
    setTarget(null);
  };

  const handleDelete = async () => {
    if (!target?.id) return;
    setDeleting(true);
    try {
      await eliminarRegistroYPagoById(target.id);
      // no hace falta manual refresh: la suscripción onSnapshot actualiza la tabla
      handleCloseConfirm();
      setDeleting(false);
    } catch (e) {
      console.error(e);
      setErrorMsg(e?.message || "No se pudo eliminar el registro.");
      setDeleting(false);
    }
  };

  return (
    <Paper sx={{ p: 0 }}>
      <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Registros del día</Typography>
        <TextField
          type="date"
          label="Fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Toolbar>

      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="body4" sx={{ mb: 1 }}>
          <b>Totales del día:</b>{" "}
          CABA <b>{totales.CABA}</b> | Z1 <b>{totales.Z1}</b> | Z2 <b>{totales.Z2}</b> | Z3 <b>{totales.Z3}</b> 
          
        </Typography>
        {errorMsg && (
          <Typography variant="caption" color="error">
            {errorMsg}
          </Typography>
        )}
      </Box>

      <TableContainer>
        <Table size="small" aria-label="registros del día">
          <TableHead>
            <TableRow>
              <TableCell>Hora</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell align="right">CABA</TableCell>
              <TableCell align="right">Z1</TableCell>
              <TableCell align="right">Z2</TableCell>
              <TableCell align="right">Z3</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Método</TableCell>
              
              <TableCell>Notas</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.creadoEn?.toDate?.().toLocaleTimeString?.() || "-"}</TableCell>
                <TableCell>{r.clienteNombre}</TableCell>
                <TableCell align="right">{r.cantidades?.CABA || 0}</TableCell>
                <TableCell align="right">{r.cantidades?.Z1 || 0}</TableCell>
                <TableCell align="right">{r.cantidades?.Z2 || 0}</TableCell>
                <TableCell align="right">{r.cantidades?.Z3 || 0}</TableCell>
                 <TableCell align="right">{currency.format(Number(r.montoTotal || 0))}</TableCell>
                <TableCell>{r.metodoPago}</TableCell>
               
                <TableCell>{r.notas || ""}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Eliminar registro y pago">
                    <span>
                      <IconButton
                        color="error"
                        onClick={() => handleAskDelete(r)}
                        size="small"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Sin registros para esta fecha
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de confirmación */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm} fullWidth maxWidth="xs">
        <DialogTitle>Eliminar registro</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que querés eliminar este registro{target?.clienteNombre ? ` de ${target.clienteNombre}` : ""}?
            {target?.montoTotal ? ` Se eliminará también el pago por ${currency.format(target.montoTotal)}.` : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={deleting}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
