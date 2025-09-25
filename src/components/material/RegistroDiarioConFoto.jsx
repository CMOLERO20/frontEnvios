// src/components/material/RegistroDiarioConFotos.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Paper, Box, Grid, Stack, Typography, Button, TextField, MenuItem,
  Autocomplete, IconButton, Divider, Alert, Avatar, LinearProgress
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useSnackbar } from "notistack";

import { getClients } from "../../utils/clientes";
import { crearRegistroDiario } from "../../utils/registros.jsx";
import { registrarPago } from "../../utils/RegistroPagoSimple.jsx";

// Firestore & Storage
import { db, storage } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { v4 as uuidv4 } from "uuid";
import { comprimirImagen } from "../../utils/comprimirImagen";

// Precios base (podés reemplazar por lectura de `precios_base/default`)
const PRECIOS = { CABA: 3800, Z1: 6000, Z2: 7900, Z3: 8900 };

export default function RegistroDiarioConFotos({ user }) {
  const { enqueueSnackbar } = useSnackbar();

  // Fecha
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));

  // Remitente
  const [clientes, setClientes] = useState([]);
  const [clienteSel, setClienteSel] = useState(null);
  const [clienteId, setClienteId] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");

  // Cantidades por zona
  const [cant, setCant] = useState({ CABA: 0, Z1: 0, Z2: 0, Z3: 0 });
  const onChangeCant = (k) => (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setCant((prev) => ({ ...prev, [k]: v }));
  };

  // Pago
  const [metodoPago, setMetodoPago] = useState("efectivo"); // "efectivo" | "transferencia"

  // Fotos
  const [imagenes, setImagenes] = useState([]); // [{id, file, url}]
  const inputRef = useRef(null);

  // Estado
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [progreso, setProgreso] = useState({ done: 0, total: 0 });

  // Cargar clientes
  useEffect(() => {
    (async () => {
      try {
        const arr = await getClients(); // [{uid, id?, nombre, email}]
        setClientes(Array.isArray(arr) ? arr : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const clientesOrdenados = useMemo(
    () => [...clientes].sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || "")),
    [clientes]
  );

  // Totales / Monto
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

  // Fotos handlers
  const handlePick = () => inputRef.current?.click();
  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const items = files.map((f, idx) => ({
      id: `${Date.now()}_${idx}`,
      file: f,
      url: URL.createObjectURL(f),
    }));
    setImagenes((prev) => [...prev, ...items]);
  };
  const eliminarImg = (id) => setImagenes((prev) => prev.filter((x) => x.id !== id));
  const resetear = () => {
    setImagenes([]);
    setMensaje(null);
  };

  // Subida con tu patrón (comprimir -> uploadBytes -> getDownloadURL)
  async function subirFotosYObtenerURLs(registroId) {
    if (!imagenes.length) return [];

    setSubiendo(true);
    setProgreso({ done: 0, total: imagenes.length });

    const urls = [];
    let done = 0;

    for (const it of imagenes) {
      try {
        // 1) Comprimir (si falla, usamos el original)
        let archivo = it.file;
        try {
          archivo = await comprimirImagen(archivo); // File/Blob JPEG
        } catch {
          // continuar con original
        }

        // 2) Nombre y ref
        const nombreArchivo = `registros_diarios/${uuidv4()}.jpg`;
        const storageRef = ref(storage, nombreArchivo);

        // 3) Subida
        const snapshot = await uploadBytes(storageRef, archivo, { contentType: "image/jpeg" });

        // 4) URL descarga
        const url = await getDownloadURL(snapshot.ref);
        urls.push({ url, path: nombreArchivo });

        done += 1;
        setProgreso({ done, total: imagenes.length });
      } catch (e) {
        console.error("Error subiendo imagen:", e);
        // Continuamos con las demás
      }
    }

    setSubiendo(false);
    return urls;
  }

  // Guardar registro + fotos + pago
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMensaje(null);

    if (!clienteId) {
      enqueueSnackbar("Seleccioná un remitente.", { variant: "warning" });
      return;
    }
    if (totalEnvios <= 0) {
      enqueueSnackbar("Cargá al menos 1 envío en alguna zona.", { variant: "warning" });
      return;
    }

    setGuardando(true);
    try {
      // 1) Crear registro diario (sin fotos ni pago aún)
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
        montoTotal,
        metodoPago, // "efectivo" | "transferencia"
        notas: "Registro generado con fotos (asociadas)",
        creadoPorUid: user?.uid || null,
        creadoPorNombre: user?.displayName || user?.email || "admin",
      });

      // 2) Subir fotos y asociarlas al registro
      const fotos = await subirFotosYObtenerURLs(registroId);
      if (fotos.length) {
        await updateDoc(doc(db, "registros_diarios", registroId), { fotos });
      }

      // 3) Crear pago y vincular
      const pagoId = await registrarPago({
        clienteId,
        clienteNombre,
        metodo: metodoPago,
        monto: montoTotal,
        creadoPor: user?.uid || "admin",
        cantidadEnvios: totalEnvios,
      });
      await updateDoc(doc(db, "registros_diarios", registroId), { pagoId });

      // Limpieza mínima
      setCant({ CABA: 0, Z1: 0, Z2: 0, Z3: 0 });
      setImagenes([]);
      setMensaje({ tipo: "success", texto: "Registro guardado, fotos asociadas y pago creado ✅" });
      enqueueSnackbar("Registro guardado, fotos asociadas y pago creado ✅", { variant: "success" });
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "Ocurrió un error al guardar." });
      enqueueSnackbar(err.message || "No se pudo guardar el registro.", { variant: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Registro diario (con fotos, sin OCR)
      </Typography>

      {mensaje && (
        <Alert sx={{ mb: 2 }} severity={mensaje.tipo === "error" ? "error" : "success"}>
          {mensaje.texto}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Autocomplete
              options={clientesOrdenados}
              value={clienteSel}
              onChange={(_, v) => {
                setClienteSel(v || null);
                setClienteId(v?.uid || v?.id || "");
                setClienteNombre(v?.nombre || "");
              }}
              getOptionLabel={(opt) =>
                opt?.nombre ? `${opt.nombre}${opt.email ? ` (${opt.email})` : ""}` : ""
              }
              isOptionEqualToValue={(opt, val) => (opt?.uid || opt?.id) === (val?.uid || val?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Remitente" size="small" required />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Método de pago"
              select
              fullWidth
              size="small"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              <MenuItem value="efectivo">efectivo</MenuItem>
              <MenuItem value="transferencia">transferencia</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Botones de fotos */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={onFilesSelected}
            style={{ display: "none" }}
          />
          <Button variant="outlined" startIcon={<PhotoCameraIcon />} onClick={handlePick}>
            Sacar/subir fotos
          </Button>
          <Button
            color="warning"
            variant="text"
            startIcon={<RestartAltIcon />}
            onClick={resetear}
            disabled={!imagenes.length}
          >
            Limpiar fotos
          </Button>
        </Stack>

        {/* Progreso de subida */}
        {subiendo && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="caption">
              Subiendo fotos… {progreso.done}/{progreso.total}
            </Typography>
          </Box>
        )}

        {/* Thumbnails */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {imagenes.map((it) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={it.id}>
              <Paper variant="outlined" sx={{ p: 1.2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar variant="rounded" src={it.url} sx={{ width: 56, height: 56 }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {it.file?.name || "foto"}
                  </Typography>
                  <IconButton onClick={() => eliminarImg(it.id)} size="small" color="error">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Cantidades por zona */}
        <Grid container spacing={2}>
          {["CABA", "Z1", "Z2", "Z3"].map((z) => (
            <Grid key={z} item xs={6} sm={3}>
              <TextField
                label={`# ${z}`}
                fullWidth
                inputMode="numeric"
                size="small"
                value={cant[z]}
                onChange={onChangeCant(z)}
              />
            </Grid>
          ))}

          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 1.2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Total envíos
              </Typography>
              <Typography variant="h6" fontWeight="bold">{totalEnvios}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 1.2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Monto total
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ${montoTotal.toLocaleString("es-AR")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!clienteId || totalEnvios <= 0 || guardando || subiendo}
          >
            {guardando ? "Guardando..." : "Guardar registro"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
