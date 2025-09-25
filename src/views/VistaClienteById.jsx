// src/pages/VistaClienteById.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClient } from "../utils/clientes";
import { getEnviosById } from "../utils/getEnvios";
import { getPagosByClient } from "../utils/getPagos";
import {
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Box,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import EditIcon from "@mui/icons-material/Edit";
import TablaPagosCliente from "../components/material/TablaPagosClientes";
import EditarClienteModal from "../components/material/EditarCliente";
import dayjs from "dayjs";

/* -------------------- helpers de fechas y conteo -------------------- */
function startOfWeekMonday(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = x.getDay(); // 0..6 (Dom..Sáb)
  const diff = dow === 0 ? 6 : dow - 1; // Lunes = 0
  x.setDate(x.getDate() - diff);
  return x;
}
function startOfMonth(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function toDateAny(v) {
  if (!v) return null;
  if (v?.toDate) return v.toDate(); // Firestore Timestamp
  if (v instanceof Date) return v;
  if (typeof v === "number" || typeof v === "string") return new Date(v);
  return null;
}
/** Si el item es un envío individual => 1.
 *  Si es un registro diario con "cantidades", suma CABA+Z1+Z2+Z3.
 */
function countEnviosRecord(item) {
  const z = item?.cantidades || item?.zonas || item?.detalleZonas;
  if (z) {
    const caba = Number(z.CABA || 0);
    const z1 = Number(z.Z1 || 0);
    const z2 = Number(z.Z2 || 0);
    const z3 = Number(z.Z3 || 0);
    const sum = caba + z1 + z2 + z3;
    if (sum > 0) return sum;
  }
  // fallback para item = envío simple
  return 1;
}
/** Intenta múltiples campos de fecha */
function getFechaEnvio(e) {
  return (
    toDateAny(e.fecha) ||
    toDateAny(e.creadoEn) ||
    toDateAny(e.creado) ||
    toDateAny(e.createdAt) ||
    null
  );
}

/* -------------------- mini card kpi -------------------- */
function StatCard({ title, value, icon: Icon, color = "#1976d2", subtitle }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
          <Stack>
            <Typography variant="overline" sx={{ opacity: 0.7 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} lineHeight={1.1}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.75, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Stack>
          <Avatar
            variant="rounded"
            sx={{ bgcolor: color, width: 48, height: 48, boxShadow: "0 4px 14px rgba(0,0,0,.18)" }}
          >
            <Icon sx={{ color: "white" }} />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* -------------------- vista principal -------------------- */
export default function VistaClienteById() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [envios, setEnvios] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [clienteSnap, enviosSnap, pagosSnap] = await Promise.all([
          getClient(id),
          getEnviosById(id),
          getPagosByClient(id),
        ]);
        if (!mounted) return;
        setCliente(clienteSnap);
        setEnvios(enviosSnap || []);
        setPagos(pagosSnap || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  /* ---- KPIs de envíos (semana/mes/acumulado) ---- */
  const { semana, mes, acumulado } = useMemo(() => {
    const inicioSemana = startOfWeekMonday();
    const inicioMes = startOfMonth();
    let sumWeek = 0;
    let sumMonth = 0;
    let sumAll = 0;

    for (const e of envios) {
      const f = getFechaEnvio(e);
      const count = countEnviosRecord(e);
      sumAll += count;
      if (f) {
        if (f >= inicioMes) sumMonth += count;
        if (f >= inicioSemana) sumWeek += count;
      }
    }
    return { semana: sumWeek, mes: sumMonth, acumulado: sumAll };
  }, [envios]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Barra superior */}
      <Box mb={2}>
        <Tooltip title="Volver">
          <IconButton onClick={() => navigate("/admin/clientes")}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Header del cliente */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
          <Stack direction="row" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Cliente: {cliente?.nombre || cliente?.email || "—"}
              </Typography>
              <Stack direction="row" gap={1} mt={0.5} flexWrap="wrap">
                {cliente?.telefono && <Chip size="small" label={`Tel: ${cliente.telefono}`} />}
                {cliente?.email && <Chip size="small" label={cliente.email} />}
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" gap={1}>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={() => setModalAbierto(true)}
            >
              Editar datos del cliente
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading && (
        <Box sx={{ my: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* KPIs de envíos */}
      <Grid container spacing={2} sx={{ opacity: loading ? 0.5 : 1, mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Envíos esta semana" value={semana} icon={CalendarViewWeekIcon} color="#29b6f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Envíos este mes" value={mes} icon={CalendarMonthIcon} color="#26a69a" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Envíos acumulados" value={acumulado} icon={AllInclusiveIcon} color="#ffa726" />
        </Grid>
      </Grid>

      {/* Movimientos (pagos) */}
      <Box>
        <Typography variant="h6" gutterBottom>
          💰 Movimientos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {/* La tabla ya soporta filtro inicial por cliente y lo bloquea */}
        <TablaPagosCliente pagos={pagos} clienteId={id} />
      </Box>

      {/* Modal editar */}
      <EditarClienteModal
        cliente={cliente}
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onGuardado={() => {
          // opcional: recargar datos del cliente
        }}
      />
    </Container>
  );
}
