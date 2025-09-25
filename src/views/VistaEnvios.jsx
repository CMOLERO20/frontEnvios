// src/views/VistaEnvios.jsx
import { useState, useEffect } from "react";
import { Container, Typography, Box, Paper } from "@mui/material";

import TablaAdmin from "../components/material/TablaAdmin";
import ModalGenerico from "../components/elementos/ModalGenerico";

import { obtenerEnvios } from "../api/crudEnvios";
import { getEnvios } from "../utils/getEnvios";

export default function VistaEnvios() {
  const [envios, setEnvios] = useState([]);
  const [filtrados, setEnviosFiltrados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");


  
 const fetchData = async () => {
         const data = await getEnvios();
         setEnvios(data);
       };
    useEffect(() => {
      
       fetchData();
     }, []);

  useEffect(() => {
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta + "T23:59:59") : null;

    const filtrados = envios.filter((envio) => {
      const fecha = envio.creado?.toDate?.() || new Date(envio.creado);
      if (desde && fecha < desde) return false;
      if (hasta && fecha > hasta) return false;

      const texto = filtro.toLowerCase();
      return [envio.recieverName, envio.localidad, envio.estado, envio.senderName].some((campo) =>
        campo?.toLowerCase().includes(texto)
      );
    });

    setEnviosFiltrados(filtrados);
  }, [envios, filtro, fechaDesde, fechaHasta]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>📦 Envíos</Typography>


      <Paper>
       <TablaAdmin
  envios={filtrados}
  onEditar={() => {}}
  onSeleccionar={() => {}}
  enviosSeleccionados={[]}
  onUpdate={() => {fetchData()}}
/>
      </Paper>

      {detalle && (
        <ModalGenerico title="Detalles del envío" onClose={() => setDetalle(null)}>
          <p><strong>Teléfono:</strong> {detalle.recieverPhone}</p>
          <p><strong>Domicilio:</strong> {detalle.recieverAddress}</p>
          {detalle.fotoUrl && (
            <img src={detalle.fotoUrl} alt="Etiqueta" className="mt-3 w-full rounded border" />
          )}
        </ModalGenerico>
      )}
    </Container>
  );
}
