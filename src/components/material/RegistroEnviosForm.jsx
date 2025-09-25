import React, { useState, useEffect, useMemo } from "react";
import { TextField, MenuItem, Button, Grid, Paper, Typography, Autocomplete } from "@mui/material";
import { crearRegistroDiario } from "../../utils/registros.jsx";
import { getClients } from "../../utils/clientes.jsx";
import { registrarPago } from "../../utils/RegistroPagoSimple.jsx"; // <-- ajustá ruta si hace falta
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useSnackbar } from "notistack";

// Precios por zona
const PRECIOS = { CABA: 3800, Z1: 6000, Z2: 7900, Z3: 8900 };

export default function RegistroEnviosForm({ user }) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));

  // Cliente seleccionado
  const [usuarios, setUsuarios] = useState([]);
  const [clienteSel, setClienteSel] = useState(null);
  const [clienteId, setClienteId] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
    const { enqueueSnackbar } = useSnackbar();
  // Datos del registro
  const [cant, setCant] = useState({ CABA: 0, Z1: 0, Z2: 0, Z3: 0 });
  const [metodoPago, setMetodoPago] = useState("efectivo"); // solo "efectivo" o "transferencia"
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const clientes = await getClients(); // debe traer { uid, nombre, email, ... }
        setUsuarios(clientes);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsuarios();
  }, []);

  const usuariosOrdenados = useMemo(
    () => [...usuarios].sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || "")),
    [usuarios]
  );

  const totalEnvios = useMemo(
    () => ["CABA", "Z1", "Z2", "Z3"].reduce((acc, k) => acc + Number(cant[k] || 0), 0),
    [cant]
  );

  const montoTotal = useMemo(() => {
    return (
      (Number(cant.CABA) || 0) * PRECIOS.CABA +
      (Number(cant.Z1) || 0) * PRECIOS.Z1 +
      (Number(cant.Z2) || 0) * PRECIOS.Z2 +
      (Number(cant.Z3) || 0) * PRECIOS.Z3
    );
  }, [cant]);

  const onChangeCant = (k) => (e) => {
    const v = e.target.value.replace(/\D/g, ""); // solo números
    setCant((prev) => ({ ...prev, [k]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteId) {
      alert("Seleccioná un remitente.");
      return;
    }
    if (totalEnvios <= 0) {
      alert("Cargá al menos 1 envío en alguna zona.");
      return;
    }

    setLoading(true);
    try {
      // 1) Crear el registro diario (sin pagoId todavía)
      const registroId = await crearRegistroDiario({
        fecha: new Date(fecha),
        clienteId,
        clienteNombre,
        cantidades: {
          CABA: +cant.CABA || 0,
          Z1: +cant.Z1 || 0,
          Z2: +cant.Z2 || 0,
          Z3: +cant.Z3 || 0,
        },
        montoTotal, // calculado automáticamente
        metodoPago, // "efectivo" | "transferencia"
        notas,
        creadoPorUid: user?.uid || null,
        creadoPorNombre: user?.displayName || user?.email || "admin",
      });

      // 2) Crear el pago
      const pagoId = await registrarPago({
        clienteId,
        clienteNombre,
        metodo: metodoPago, // solo "efectivo" o "transferencia"
        monto: montoTotal,
        creadoPor: user?.uid || "admin",
        cantidadEnvios: totalEnvios,
         cantidades: {
          CABA: +cant.CABA || 0,
          Z1: +cant.Z1 || 0,
          Z2: +cant.Z2 || 0,
          Z3: +cant.Z3 || 0,
        },
      });

      // 3) Vincular pagoId al registro
      await updateDoc(doc(db, "registros_diarios", registroId), { pagoId });

      // limpiar mínimos (dejamos cliente seleccionado por comodidad)
      setCant({ CABA: 0, Z1: 0, Z2: 0, Z3: 0 });
      setNotas("");
     enqueueSnackbar("Cliente creado correctamente", { variant: "success" });
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar el registro y/o el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Registro de envíos 
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Fecha"
              type="date"
              fullWidth
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} />

          {/* AUTOCOMPLETE DE CLIENTES */}
          <Grid size={{ xs:10, sm:3 }}>
            <Autocomplete
              options={usuariosOrdenados}
              value={clienteSel}
              onChange={(_, value) => {
                setClienteSel(value || null);
                setClienteId(value?.uid || value?.id || "");
                setClienteNombre(value?.nombre || "");
              }}
              getOptionLabel={(opt) =>
                opt?.nombre ? `${opt.nombre}${opt.email ? ` (${opt.email})` : ""}` : ""
              }
              isOptionEqualToValue={(opt, val) => opt?.uid === val?.uid}
              loading={!usuarios.length}
              noOptionsText="Escribí para buscar"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Remitente"
                  required
                  helperText={"Seleccioná un remitente"}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>
                      <b>{option.nombre}</b>
                    </span>
                    <small style={{ opacity: 0.7 }}>{option.email || `UID: ${option.uid}`}</small>
                  </div>
                </li>
              )}
            />
          </Grid>

          {["CABA", "Z1", "Z2", "Z3"].map((z) => (
            <Grid key={z} size={{ xs: 6, sm: 1 }}>
              <TextField
                label={`# ${z}`}
                fullWidth
                inputMode="numeric"
                value={cant[z]}
                onChange={onChangeCant(z)}
              />
            </Grid>
          ))}

          <Grid size={{ xs: 10, sm:1.5 }}>
            <TextField label="Monto total" fullWidth value={montoTotal} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid size={{ xs:12, sm:3 }}>
            <TextField
              label="Método de pago"
              select
              fullWidth
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              {["efectivo", "transferencia"].map((op) => (
                <MenuItem key={op} value={op}>
                  {op}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 4, sm:4 }}>
            <TextField
              label="Notas"
              fullWidth
              multiline
              minRows={1}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 3, sm:2 }}>
            <Typography variant="h6">
              Total envíos: <b>{totalEnvios}</b>
            </Typography>
          </Grid>
          <Grid size={{ xs: 3, sm:3 } }>
            <Button size="large" type="submit" variant="contained" disabled={loading || !clienteId || totalEnvios <= 0}>
              {loading ? "Guardando..." : "Guardar registro"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
