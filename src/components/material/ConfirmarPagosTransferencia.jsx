// src/components/material/ConfirmarPagosTransferencia.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText,
  Toolbar, Stack, TextField, Autocomplete, CircularProgress
} from "@mui/material";
import {
  collection, getDocs, updateDoc, doc, query, where, serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { getClients } from "../../utils/clientes";

const currencyAR = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

// helpers de fecha (milisegundos)
const startOfDayMs = (isoDateStr) => {
  const d = new Date(isoDateStr);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const endOfDayNextMs = (isoDateStr) => {
  const d = new Date(isoDateStr);
  d.setHours(24, 0, 0, 0); // día siguiente 00:00
  return d.getTime();
};
const getCreatedMillis = (p) => {
  if (p?.creado?.toMillis) return p.creado.toMillis();
  if (p?.fecha?.toMillis) return p.fecha.toMillis();
  if (p?.creado instanceof Date) return p.creado.getTime();
  if (typeof p?.creado === "string" || typeof p?.creado === "number") return new Date(p.creado).getTime();
  return 0;
};

export default function ConfirmarPagosTransferencia() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);

  // Filtros
  const [clientes, setClientes] = useState([]);
  const [clienteSel, setClienteSel] = useState(null);
  const [clienteId, setClienteId] = useState("");
  const [desde, setDesde] = useState(() => new Date().toISOString().slice(0, 10));
  const [hasta, setHasta] = useState(() => new Date().toISOString().slice(0, 10));
  const [loadingClientes, setLoadingClientes] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // cargar clientes para el filtro
  useEffect(() => {
    (async () => {
      try {
        setLoadingClientes(true);
        const arr = await getClients(); // [{uid, nombre, email, ...}]
        setClientes(Array.isArray(arr) ? arr : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingClientes(false);
      }
    })();
  }, []);

  const clientesOrdenados = useMemo(
    () => [...clientes].sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || "")),
    [clientes]
  );

// helpers (usa horario local)
const startOfDayMs = (iso) => dayjs(iso, "YYYY-MM-DD").startOf("day").valueOf();
const endOfDayMs   = (iso) => dayjs(iso, "YYYY-MM-DD").endOf("day").valueOf();

const getCreatedMillis = (p) => {
  if (p.creado?.toMillis) return p.creado.toMillis();                // Firestore Timestamp
  if (p.creado?.toDate)  return p.creado.toDate().getTime();         // Firestore Timestamp (alt)
  if (typeof p.creado === "number") return p.creado;                 // ya son ms
  if (typeof p.creado === "string") return dayjs(p.creado).valueOf();// ISO/string
  return 0;
};

// === SIN ÍNDICES: filtro método en Firestore y resto en memoria ===
const fetchPagos = async () => {
  setLoading(true);
  try {
    const baseQ = query(collection(db, "pagos"), where("metodo", "==", "transferencia"));
    const snap = await getDocs(baseQ);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const desdeMs = desde ? startOfDayMs(desde) : -Infinity;
    const hastaMs = hasta ? endOfDayMs(hasta)   :  Infinity;  // INCLUSIVO

    const data = all
      .filter((p) => {
        // estado pendiente
        if (String(p.estado || "").toLowerCase() !== "pendiente") return false;

        // cliente (si hay)
        if (clienteId && p.clienteId !== clienteId) return false;

        // rango de fechas
        const t = getCreatedMillis(p);
        if (t < desdeMs || t > hastaMs) return false; // <= fin de día

        return true;
      })
      .sort((a, b) => getCreatedMillis(b) - getCreatedMillis(a)); // más reciente primero

    setPagos(data);
  } catch (e) {
    console.error(e);
    enqueueSnackbar("No se pudieron cargar los pagos.", { variant: "error" });
  } finally {
    setLoading(false);
  }
};


  // traer pagos cuando cambian filtros principales
  useEffect(() => {
    fetchPagos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId, desde, hasta]);

  const confirmarPago = async () => {
    if (!pagoSeleccionado) return;

    try {
      await updateDoc(doc(db, "pagos", pagoSeleccionado.id), {
        estado: "confirmado",
        confirmadoEn: serverTimestamp(),
      });
      enqueueSnackbar("Pago confirmado correctamente ✅", { variant: "success" });
      setPagoSeleccionado(null);
      fetchPagos();
    } catch (e) {
      console.error(e);
      enqueueSnackbar("No se pudo confirmar el pago.", { variant: "error" });
    }
  };

  const limpiarFiltros = () => {
    setClienteSel(null);
    setClienteId("");
    const hoy = new Date().toISOString().slice(0, 10);
    setDesde(hoy);
    setHasta(hoy);
  };

  return (
    <Box maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Confirmar Pagos por Transferencia
      </Typography>

      {/* Filtros */}
      <Toolbar sx={{ px: 0, gap: 2, flexWrap: "wrap" }}>
        <Autocomplete
          sx={{ minWidth: 260 }}
          options={clientesOrdenados}
          value={clienteSel}
          onChange={(_, v) => {
            setClienteSel(v || null);
            setClienteId(v?.uid || v?.id || "");
          }}
          getOptionLabel={(opt) =>
            opt?.nombre ? `${opt.nombre}${opt.email ? ` (${opt.email})` : ""}` : ""
          }
          isOptionEqualToValue={(opt, val) => (opt?.uid || opt?.id) === (val?.uid || val?.id)}
          loading={loadingClientes}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cliente"
              placeholder="Buscar cliente…"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingClientes ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => {
            // evitar warning por key dentro de spread
            const { key, ...liProps } = props;
            return (
              <li key={key} {...liProps}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span><b>{option.nombre}</b></span>
                  <small style={{ opacity: 0.7 }}>
                    {option.email || `UID: ${option.uid || option.id}`}
                  </small>
                </div>
              </li>
            );
          }}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={limpiarFiltros} disabled={loading}>
            Limpiar
          </Button>
          <Button variant="contained" onClick={fetchPagos} disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </Stack>
      </Toolbar>

      <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 480 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Envíos</TableCell>
              <TableCell align="center">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagos.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.clienteNombre || "-"}</TableCell>
                <TableCell align="right">{currencyAR.format(Number(p.monto || 0))}</TableCell>
                <TableCell>
                  {p.creado?.toDate
                    ? dayjs(p.creado.toDate()).format("DD/MM/YYYY")
                    : p.fecha?.toDate
                    ? dayjs(p.fecha.toDate()).format("DD/MM/YYYY")
                    : "-"}
                </TableCell>
                <TableCell align="right">{p.cantidadEnvios ?? p.envios?.length ?? 0}</TableCell>
                <TableCell align="center">
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
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay pagos pendientes para los filtros seleccionados.
                </TableCell>
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
            ¿Confirmar el pago de <strong>{currencyAR.format(Number(pagoSeleccionado?.monto || 0))}</strong>{" "}
            de <strong>{pagoSeleccionado?.clienteNombre || "-"}</strong>?
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
