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
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { subscribeRegistrosPorDia } from "../../utils/registros.jsx";
import { eliminarRegistroYPagoById } from "../../utils/registros.jsx";
import ModalFotosRegistro from "./ModalFotoRegistro";

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export default function RegistrosDelDia() {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [clienteId] = useState("");
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
const [modalAbierto, setModalAbierto] = useState(false);

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

  const totalEnvios = totales.CABA + totales.Z1 + totales.Z2 + totales.Z3;

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
      handleCloseConfirm();
    } catch (e) {
      console.error(e);
      setErrorMsg(e?.message || "No se pudo eliminar el registro.");
      setDeleting(false);
    }
  };

  return (
    <Paper sx={{ p: 0 }}>
      {/* Header */}
      <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Registros del día
        </Typography>
        <TextField
          type="date"
          label="Fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Toolbar>

      {/* Totales (chips con colores + total de envíos a la derecha) */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ mr: 1 }}>
            Totales del día:
          </Typography>
          <Chip label={`CABA ${totales.CABA}`} color="primary" variant="filled" />
          <Chip label={`Z1 ${totales.Z1}`} color="success" variant="filled" />
          <Chip label={`Z2 ${totales.Z2}`} color="warning" variant="filled" />
          <Chip label={`Z3 ${totales.Z3}`} color="error" variant="filled" />
          <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />
          <Chip label={`Total envíos ${totalEnvios}`} color="secondary" variant="filled" />
        </Stack>
        {errorMsg && (
          <Typography variant="caption" color="error">
            {errorMsg}
          </Typography>
        )}
      </Box>

      {/* Tabla con header sticky y scroll interno */}
      <TableContainer
        sx={{
          height: 420,          // alto fijo del contenedor
          overflow: "auto",     // scroll
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
          <TableHead
            sx={{
              "& th": { fontWeight: 600, bgcolor: "grey.50" },
            }}
          >
            {/* Fila 1: encabezado agrupado */}
            <TableRow>
              <TableCell rowSpan={2}>Hora</TableCell>
              <TableCell rowSpan={2}>Cliente</TableCell>
              <TableCell align="center" colSpan={4}>
                Zonas
              </TableCell>
              <TableCell rowSpan={2}>Método</TableCell>
              <TableCell rowSpan={2} align="right">
                Monto
              </TableCell>
              <TableCell rowSpan={2}>Notas</TableCell>
              <TableCell rowSpan={2} align="center">
                Acciones
              </TableCell>
            </TableRow>
            {/* Fila 2: columnas por zona */}
            <TableRow>
              <TableCell align="right">CABA</TableCell>
              <TableCell align="right">Z1</TableCell>
              <TableCell align="right">Z2</TableCell>
              <TableCell align="right">Z3</TableCell>
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
                <TableCell>{r.metodoPago}</TableCell>
                <TableCell align="right">{currency.format(Number(r.montoTotal || 0))}</TableCell>
                <TableCell>{r.notas || ""}</TableCell>
                <TableCell>
  <Button
    variant="outlined"
    onClick={() => {
      setRegistroSeleccionado(r); // o registro.imagenes si preferís
      setModalAbierto(true);
    }}
  >
    Ver fotos
  </Button>
</TableCell>
                <TableCell align="center">
                  <Tooltip title="Eliminar registro y pago">
                    <span>
                      <IconButton color="error" onClick={() => handleAskDelete(r)} size="small">
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

      <ModalFotosRegistro
  open={modalAbierto}
  onClose={() => setModalAbierto(false)}
  imagenes={registroSeleccionado?.fotos || []}
/>

      {/* Confirmación eliminar */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm} fullWidth maxWidth="xs">
        <DialogTitle>Eliminar registro</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que querés eliminar este registro
            {target?.clienteNombre ? ` de ${target.clienteNombre}` : ""}?
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
