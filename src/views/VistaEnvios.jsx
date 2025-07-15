import { useState, useEffect } from "react";


import FiltroBusqueda from "../components/elementos/FiltroBusqueda";
import TarjetaResumen from "../components/elementos/TarjetaResumen";
import ModalGenerico from "../components/elementos/ModalGenerico";
import FiltroFecha from "../components/elementos/FiltroFecha";
import BotonVolver from "../components/elementos/BotonVolver";
import { getEnvios } from "../utils/getEnvios";

export default function VistaEnvios() {
  const [envios, setEnvios] = useState([]);
   const [filtrados, setEnviosFiltrados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [fechaDesde, setFechaDesde] = useState("");
const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getEnvios();
      setEnvios(data);
    };
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
    <div className="p-6 max-w-6xl mx-auto">
        
<BotonVolver soloIcono />
      <h2 className="text-2xl font-bold mb-4">📦 Envíos</h2>
    <FiltroFecha
  fechaDesde={fechaDesde}
  fechaHasta={fechaHasta}
  setFechaDesde={setFechaDesde}
  setFechaHasta={setFechaHasta}
/>
      <FiltroBusqueda value={filtro} onChange={(e) => setFiltro(e.target.value)} />

      <div className="grid gap-3">
        {filtrados.map((envio) => (
          <TarjetaResumen
            key={envio.id}
            titulo={`Destino: ${envio.recieverAddress} – ${envio.localidad}`}
            subtitulo={`Estado: ${envio.estado} `}
            onClick={() => setDetalle(envio)}
          />
        ))}
      </div>

      {detalle && (
        <ModalGenerico title="Detalles del envío" onClose={() => setDetalle(null)}>
          <p><strong>Teléfono:</strong> {detalle.recieverPhone}</p>
          <p><strong>Domicilio:</strong> {detalle.recieverAddress}</p>
          {detalle.fotoUrl && (
            <img src={detalle.fotoUrl} alt="Etiqueta" className="mt-3 w-full rounded border" />
          )}
        </ModalGenerico>
      )}
    </div>
  );
}