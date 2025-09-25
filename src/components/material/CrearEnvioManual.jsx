import { useEffect, useMemo, useState } from "react";
import {
  Card, CardHeader, CardContent, CardActions,
  Grid, TextField, Button, Divider, Autocomplete, Typography, Chip, Tooltip
} from "@mui/material";
import { useSnackbar } from "notistack";

import { crearEnvioManualCompat } from "../../utils/envios";
import { downloadEtiquetaPDF } from "../../utils/etiquetas";
import { getClients } from "../../utils/clientes"; // Debe traer { uid, nombre, email, role, activo }
import localidades  from "../../utils/localidades";  // Array [{ nombre, zona }, ...]

const PRECIOS = { CABA: 3800, Z1: 6000, Z2: 7900, Z3: 8900 };

export default function CrearEnvioManual({ currentUser }) {
  const { enqueueSnackbar } = useSnackbar();

  // remitente
  const [clientes, setClientes] = useState([]);
  const [remitenteSel, setRemitenteSel] = useState(null);
  const [remitenteId, setRemitenteId] = useState("");
  const [remitenteNombre, setRemitenteNombre] = useState("");

  // destinatario
  const [destNombre, setDestNombre] = useState("");
  const [destTelefono, setDestTelefono] = useState("");
  const [destDireccion, setDestDireccion] = useState("");
  const [localidadSel, setLocalidadSel] = useState(null); // { nombre, zona }
  const [zona, setZona] = useState("");

  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [ultimoEnvio, setUltimoEnvio] = useState(null);

  // Si NO es client, cargo clientes activos para el selector
  useEffect(() => {
    const cargar = async () => {
      try {
        const arr = await getClients();
        // solo clientes activos para evitar seleccionar uno deshabilitado
        const activos = (arr || []).filter(
          (c) => (c.role || "client") === "client" && c.activo !== false
        );
        activos.sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || ""));
        setClientes(activos);
      } catch (e) {
        console.error(e);
      }
    };
    if ((currentUser?.role || "").toLowerCase() !== "client") {
      cargar();
    }
  }, [currentUser]);

  // Si es client → fijar remitente y bloquear
  useEffect(() => {
    if ((currentUser?.role || "").toLowerCase() === "client") {
      setRemitenteId(currentUser.uid);
      setRemitenteNombre(currentUser.nombre || currentUser.email || "Cliente");
      setRemitenteSel({
        uid: currentUser.uid,
        nombre: currentUser.nombre || currentUser.email || "Cliente",
        email: currentUser.email,
      });
    }
  }, [currentUser]);

  // precio calculado por zona (solo informativo)
  const precio = useMemo(() => (zona ? PRECIOS[zona] || 0 : 0), [zona]);

  // validación mínima
  const puedeGuardar =
    !!remitenteId &&
    !!destNombre?.trim() &&
    !!destDireccion?.trim() &&
    !!localidadSel?.nombre &&
    !!zona;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!puedeGuardar) return;

    setGuardando(true);
    try {
      const destinatario = {
        nombre: destNombre.trim(),
        telefono: destTelefono.trim(),
        direccion: destDireccion.trim(),
        localidad: localidadSel.nombre,
        zona,
      };

      const { id, numeroEnvio } = await crearEnvioManualCompat({
        remitenteId,
        senderName: remitenteNombre,
        destinatario,
        precio,
        notas,
        fotoUrl: "",
        creadoPorUid: currentUser?.uid || null,
        creadoPorRole: currentUser?.role || null,
      });

      enqueueSnackbar("Envío creado correctamente ✅", { variant: "success" });

      const etiquetaData = { numeroEnvio, remitenteNombre, destinatario };
      setUltimoEnvio(etiquetaData);
      downloadEtiquetaPDF(etiquetaData);

      // reset mínimos (mantené remitente fijo si es client)
      setDestNombre("");
      setDestTelefono("");
      setDestDireccion("");
      setLocalidadSel(null);
      setZona("");
      setNotas("");
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.message || "No se pudo crear el envío.", { variant: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardHeader
          title={<Typography variant="h6" fontWeight={800}>Crear envío manual</Typography>}
          subheader="Cargá los datos del destinatario y elegí la localidad"
          action={
            <>
              {ultimoEnvio && (
                <Tooltip title="Reimprimir última etiqueta">
                  <Button
                    size="small"
                    onClick={() => downloadEtiquetaPDF(ultimoEnvio)}
                    sx={{ textTransform: "none" }}
                  >
                    Imprimir etiqueta
                  </Button>
                </Tooltip>
              )}
              {zona ? (
                <Chip
                  sx={{ ml: 1 }}
                  label={`Precio estimado: $${(precio || 0).toLocaleString("es-AR")}`}
                  variant="outlined"
                  size="small"
                />
              ) : null}
            </>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {/* Remitente */}
            <Grid item xs={12}>
              {(currentUser?.role || "").toLowerCase() === "client" ? (
                <TextField
                  label="Remitente"
                  fullWidth
                  value={remitenteNombre}
                  disabled
                  helperText="Tu usuario está fijado como remitente"
                />
              ) : (
                <Autocomplete
                  options={clientes}
                  value={remitenteSel}
                  onChange={(_e, v) => {
                    setRemitenteSel(v || null);
                    setRemitenteId(v?.uid || "");
                    setRemitenteNombre(v?.nombre || v?.email || "");
                  }}
                  getOptionLabel={(opt) =>
                    opt?.nombre ? `${opt.nombre}${opt.email ? ` (${opt.email})` : ""}` : ""
                  }
                  isOptionEqualToValue={(opt, val) => opt?.uid === val?.uid}
                  renderOption={(props, option) => {
                    // evitar warning por 'key' en spread
                    const { key, ...rest } = props;
                    return (
                      <li key={key} {...rest}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span><b>{option.nombre}</b></span>
                          <small style={{ opacity: 0.7 }}>{option.email || `UID: ${option.uid}`}</small>
                        </div>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Remitente (cliente)" required />
                  )}
                />
              )}
            </Grid>

            {/* Destinatario */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Destinatario - Nombre"
                fullWidth
                required
                value={destNombre}
                onChange={(e) => setDestNombre(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Destinatario - Teléfono"
                fullWidth
                inputMode="tel"
                value={destTelefono}
                onChange={(e) => setDestTelefono(e.target.value.replace(/[^\d\s()+-]/g, ""))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Dirección"
                fullWidth
                required
                placeholder="Calle 123, Piso/Depto"
                value={destDireccion}
                onChange={(e) => setDestDireccion(e.target.value)}
              />
            </Grid>

            {/* Localidad + Zona */}
            <Grid item xs={12} sm={8}>
              <Autocomplete
                options={localidades || []}
                value={localidadSel}
                onChange={(_e, v) => {
                  setLocalidadSel(v || null);
                  setZona(v?.zona || "");
                }}
                getOptionLabel={(opt) => opt?.nombre || ""}
                isOptionEqualToValue={(opt, val) => opt?.nombre === val?.nombre}
                renderOption={(props, option) => {
                  const { key, ...rest } = props;
                  return (
                    <li key={key} {...rest}>
                      <span style={{ display: "flex", gap: 8 }}>
                        <b>{option.nombre}</b> <Chip size="small" label={option.zona} />
                      </span>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Localidad" required placeholder="Buscar localidad..." />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Zona"
                fullWidth
                value={zona}
                InputProps={{ readOnly: true }}
                helperText={zona ? `Precio estimado $${(PRECIOS[zona] || 0).toLocaleString("es-AR")}` : "Elegí una localidad"}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notas (opcional)"
                fullWidth
                minRows={2}
                maxRows={4}
                multiline
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button type="submit" variant="contained" disabled={guardando || !puedeGuardar}>
            {guardando ? "Guardando..." : "Crear envío y generar etiqueta"}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
