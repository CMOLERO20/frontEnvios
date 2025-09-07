// TablaPagosCliente.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Grid, Toolbar, Stack, Button, TextField, MenuItem, Typography,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Chip, Autocomplete
} from "@mui/material";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const currencyAR = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const ESTADOS = [
  { label: "Todos", value: "" },
  { label: "Confirmado", value: "confirmado" },
  { label: "Pendiente", value: "pendiente" },
];

const METODOS = [
  { label: "Todos", value: "" },
  { label: "Transferencia", value: "transferencia" },
  { label: "Efectivo", value: "efectivo" },
  { label: "Cuenta Corriente", value: "cuenta_corriente" },
];

function toDateAny(v) {
  if (v?.toDate) return v.toDate(); // Firestore Timestamp
  if (v instanceof Date) return v;
  if (typeof v === "string" || typeof v === "number") return new Date(v);
  return null;
}

function estadoChip(estado) {
  const e = String(estado || "").toLowerCase();
  const color = e === "confirmado" ? "success" : e === "pendiente" ? "warning" : "default";
  const label = e ? e[0].toUpperCase() + e.slice(1) : "-";
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}

function metodoChip(m) {
  const e = String(m || "");
  const color = e === "efectivo" ? "primary" : e === "transferencia" ? "info" : "default";
  return <Chip size="small" label={e || "-"} color={color} variant="outlined" />;
}

// intenta leer el desglose por zona
function getZonas(p) {
  const z = p?.detalleZonas || p?.cantidades || p?.zonas || {};
  return {
    CABA: Number(z.CABA || 0),
    Z1: Number(z.Z1 || 0),
    Z2: Number(z.Z2 || 0),
    Z3: Number(z.Z3 || 0),
  };
}

export default function TablaPagosCliente({
  pagos,
  clienteId: clienteIdProp,
  clienteNombre: clienteNombreProp,
  cliente: clienteObjProp,
}) {
  // filtros
  const [filtroEstado, setFiltroEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [clienteSel, setClienteSel] = useState(null);
  const [filtroClienteId, setFiltroClienteId] = useState("");

  // valores desde props
  const presetClienteId =
    clienteObjProp?.id ?? clienteObjProp?.uid ?? clienteIdProp ?? "";
  const presetClienteNombre =
    clienteObjProp?.nombre ?? clienteNombreProp ?? "";
  const isPresetCliente = !!presetClienteId; // 👈 si viene por props, bloquear UI

  // tabla
  const [pagina, setPagina] = useState(0);
  const pagosPorPagina = 25;

  // opciones de clientes (derivadas de los pagos)
  const clientesOptions = useMemo(() => {
    const map = new Map();
    (pagos || []).forEach((p) => {
      const id = p.clienteId || p.clienteNombre || "";
      const nombre = p.clienteNombre || "(sin nombre)";
      if (id && !map.has(id)) map.set(id, { id, nombre });
    });
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [pagos]);

  // Aplicar preset si vino por props
  useEffect(() => {
    if (presetClienteId) {
      const opt = clientesOptions.find((c) => c.id === presetClienteId);
      setFiltroClienteId(presetClienteId);
      setClienteSel(opt || { id: presetClienteId, nombre: presetClienteNombre || presetClienteId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetClienteId, presetClienteNombre, clientesOptions]);

  const filtrados = useMemo(() => {
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null;

    return (pagos || [])
      .filter((p) => {
        const fechaPago = toDateAny(p.creado) || toDateAny(p.fecha);
        if (desde && fechaPago && fechaPago < desde) return false;
        if (hasta && fechaPago && fechaPago > hasta) return false;
        if (filtroEstado && String(p.estado || "").toLowerCase() !== filtroEstado) return false;
        if (filtroMetodo && String(p.metodo || "") !== filtroMetodo) return false;
        if (filtroClienteId) {
          const pid = p.clienteId || p.clienteNombre || "";
          if (pid !== filtroClienteId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const A = toDateAny(a.creado) || toDateAny(a.fecha) || 0;
        const B = toDateAny(b.creado) || toDateAny(b.fecha) || 0;
        return B - A;
      });
  }, [pagos, filtroEstado, fechaDesde, fechaHasta, filtroMetodo, filtroClienteId]);

  useEffect(() => setPagina(0), [filtroEstado, fechaDesde, fechaHasta, filtroMetodo, filtroClienteId]);

  const paginaActual = useMemo(
    () => filtrados.slice(pagina * pagosPorPagina, pagina * pagosPorPagina + pagosPorPagina),
    [filtrados, pagina]
  );

  const totales = useMemo(() => {
    const base = filtrados.reduce(
      (acc, p) => {
        const z = getZonas(p);
        acc.monto += Number(p.monto || 0);
        acc.CABA += z.CABA;
        acc.Z1 += z.Z1;
        acc.Z2 += z.Z2;
        acc.Z3 += z.Z3;
        return acc;
      },
      { monto: 0, CABA: 0, Z1: 0, Z2: 0, Z3: 0 }
    );
    const sumZonas = base.CABA + base.Z1 + base.Z2 + base.Z3;
    const fallbackEnvios = filtrados.reduce(
      (a, p) => a + Number(p.cantidadEnvios ?? p.envios?.length ?? 0),
      0
    );
    return { ...base, envios: sumZonas > 0 ? sumZonas : fallbackEnvios };
  }, [filtrados]);

  function limpiarFiltros() {
    setFiltroEstado("");
    setFiltroMetodo("");
    setFechaDesde("");
    setFechaHasta("");
    // si el cliente vino por props, no lo limpiamos
    if (!isPresetCliente) {
      setClienteSel(null);
      setFiltroClienteId("");
    }
  }

  function descargarPDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
    const marginX = 36;
    const marginY = 40;

    // Encabezado
    doc.setFontSize(14);
    doc.text("Pagos (lista filtrada)", marginX, marginY);
    doc.setFontSize(10);
    const clienteNombreLinea =
      (filtroClienteId &&
        (clientesOptions.find((c) => c.id === filtroClienteId)?.nombre ||
          presetClienteNombre ||
          filtroClienteId)) ||
      "Todos";
    const filtrosLinea = [
      fechaDesde ? `Desde: ${dayjs(fechaDesde).format("DD/MM/YYYY")}` : "Desde: -",
      fechaHasta ? `Hasta: ${dayjs(fechaHasta).format("DD/MM/YYYY")}` : "Hasta: -",
      filtroMetodo ? `Método: ${filtroMetodo}` : "Método: Todos",
      filtroEstado ? `Estado: ${filtroEstado}` : "Estado: Todos",
      `Cliente: ${clienteNombreLinea}`,
    ].join("   |   ");
    doc.text(filtrosLinea, marginX, marginY + 16);

    // Head agrupado "Zonas" y orden: Fecha, Cliente, Zonas..., Monto, Método, Estado
    const head = [
      [
        { content: "Fecha" },
        { content: "Cliente" },
        { content: "Zonas", colSpan: 4, styles: { halign: "center" } },
        { content: "Monto" },
        { content: "Método" },
        { content: "Estado" },
      ],
      ["", "", "CABA", "Z1", "Z2", "Z3", "", "", ""],
    ];

    // Body
    const body = filtrados.map((p) => {
      const fecha = toDateAny(p.creado) || toDateAny(p.fecha);
      const z = getZonas(p);
      return [
        fecha ? dayjs(fecha).format("DD/MM/YYYY") : "-",
        p.clienteNombre || "-",
        z.CABA,
        z.Z1,
        z.Z2,
        z.Z3,
        currencyAR.format(Number(p.monto || 0)),
        p.metodo || "-",
        String(p.estado || ""),
      ];
    });

    autoTable(doc, {
      startY: marginY + 28,
      head,
      body,
      styles: { fontSize: 9, cellPadding: 6, textColor: 20 },
      headStyles: { fillColor: [245, 245, 245], textColor: 20, fontStyle: "bold" },
      columnStyles: {
        2: { halign: "right" }, // CABA
        3: { halign: "right" }, // Z1
        4: { halign: "right" }, // Z2
        5: { halign: "right" }, // Z3
        6: { halign: "right" }, // Monto
      },
      foot: [
        [
          { content: "Totales", colSpan: 2 },
          { content: String(totales.CABA), styles: { halign: "right" } },
          { content: String(totales.Z1), styles: { halign: "right" } },
          { content: String(totales.Z2), styles: { halign: "right" } },
          { content: String(totales.Z3), styles: { halign: "right" } },
          { content: currencyAR.format(totales.monto), styles: { halign: "right" } },
          { content: "" },
          { content: "" },
        ],
      ],
      footStyles: { fillColor: [245, 245, 245], textColor: 20, fontStyle: "bold" },
      margin: { left: marginX, right: marginX },
    });

    const hoy = dayjs().format("YYYYMMDD_HHmm");
    doc.save(`pagos_filtrados_${hoy}.pdf`);
  }

  return (
    <Box>
      {/* Filtros y acción */}
      <Toolbar sx={{ px: 0, gap: 2, flexWrap: "wrap" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs:12, sm:6, md:4 }} >
            <Autocomplete
              options={clientesOptions}
              value={clienteSel}
              onChange={(_, v) => {
                setClienteSel(v || null);
                setFiltroClienteId(v?.id || "");
              }}
              getOptionLabel={(o) => o?.nombre || ""}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disabled={isPresetCliente}                  
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  size="small"
                  placeholder="Buscar cliente"
                  
                />
              )}
            />
          </Grid>

          <Grid  md={2.5}>
            <TextField
              label="Desde"
              type="date"
              fullWidth
              size="small"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2.5}>
            <TextField
              label="Hasta"
              type="date"
              fullWidth
              size="small"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs:6, sm:3, md:2.5 }}>
            <TextField
              label="Método de Pago"
              select
              fullWidth
              size="small"
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
            >
              {METODOS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs:6, sm:3, md:2.5 }}>
            <TextField
              label="Estado"
              select
              fullWidth
              size="small"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              {ESTADOS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md>
            <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              <Button variant="outlined" onClick={limpiarFiltros}>Limpiar</Button>
              <Button variant="contained" onClick={descargarPDF}>Exportar PDF</Button>
            </Stack>
          </Grid>
        </Grid>
      </Toolbar>

      {/* Totales de la lista filtrada */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" ,p: 2}}  >
        <Typography variant="body2"><b>Registros:</b> {filtrados.length}</Typography>
        <Typography variant="body2">
          <b>Envíos:</b> {totales.envios} (CABA {totales.CABA} | Z1 {totales.Z1} | Z2 {totales.Z2} | Z3 {totales.Z3})
        </Typography>
        <Typography variant="body2"><b>Total Pagos:</b> {currencyAR.format(totales.monto)}</Typography>
      </Stack>

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
        <Table size="small" stickyHeader>
          <TableHead sx={{ "& th": { bgcolor: "grey.50", fontWeight: 600 } }}>
            <TableRow>
              <TableCell rowSpan={2}>Fecha</TableCell>
              <TableCell rowSpan={2}>Cliente</TableCell>
              <TableCell align="center" colSpan={4}>Zonas</TableCell>
              <TableCell rowSpan={2} align="right">Monto</TableCell>
              <TableCell rowSpan={2}>Método</TableCell>
              <TableCell rowSpan={2}>Estado</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="right">CABA</TableCell>
              <TableCell align="right">Z1</TableCell>
              <TableCell align="right">Z2</TableCell>
              <TableCell align="right">Z3</TableCell>
            </TableRow>
          </TableHead>

          <TableBody
            sx={{
              "& tr:nth-of-type(odd)": { bgcolor: "action.hover" },
              "& td, & th": { py: 1 },
            }}
          >
            {paginaActual.map((pago) => {
              const fecha = toDateAny(pago.creado) || toDateAny(pago.fecha);
              const z = getZonas(pago);
              return (
                <TableRow key={pago.id} hover>
                  <TableCell>{fecha ? dayjs(fecha).format("DD/MM/YYYY") : "-"}</TableCell>
                  <TableCell>{pago.clienteNombre || "-"}</TableCell>
                  <TableCell align="right">{z.CABA}</TableCell>
                  <TableCell align="right">{z.Z1}</TableCell>
                  <TableCell align="right">{z.Z2}</TableCell>
                  <TableCell align="right">{z.Z3}</TableCell>
                  <TableCell align="right">{currencyAR.format(Number(pago.monto || 0))}</TableCell>
                  <TableCell>{metodoChip(pago.metodo)}</TableCell>
                  <TableCell>{estadoChip(pago.estado)}</TableCell>
                </TableRow>
              );
            })}

            {paginaActual.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay resultados para los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtrados.length}
        page={pagina}
        onPageChange={(e, nuevaPagina) => setPagina(nuevaPagina)}
        rowsPerPage={pagosPorPagina}
        rowsPerPageOptions={[pagosPorPagina]}
      />
    </Box>
  );
}
