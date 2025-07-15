import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TarjetaResumen from "../components/elementos/TarjetaResumen";
import BotonVolver from "../components/elementos/BotonVolver";
import { getClient } from "../utils/getClients";
import { getEnviosById } from "../utils/getEnvios";
import { getPagosByClient } from "../utils/getPagos";
import ListaEnviosCliente from "../components/elementos/ListaEnviosCliente";

export default function VistaClienteById() {
  const { id } = useParams();
  console.log("🚀 ~ VistaClienteById ~  id:",  id)
  const [cliente, setCliente] = useState(null);
  const [envios, setEnvios] = useState([]);
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const clienteSnap = await getClient(id);
      setCliente(clienteSnap);

      const enviosSnap = await getEnviosById(id);
      setEnvios(enviosSnap);

      const pagosSnap = await getPagosByClient(id);
      setPagos(pagosSnap);
    };

    fetchData();
  }, [id]);

  const totalEnvios = envios.length;
  const demorados = envios.filter((e) => e.estado === "Demorado").length;
  const porcentajeDemorados = totalEnvios ? Math.round((demorados / totalEnvios) * 100) : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <BotonVolver ruta="/admin" />
      <h2 className="text-2xl font-bold mb-4">👤 Cliente: {cliente?.nombre || cliente?.email}</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow text-center">
          <h3 className="text-sm text-gray-500">Total de Envíos</h3>
          <p className="text-xl font-bold">{totalEnvios}</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <h3 className="text-sm text-gray-500">% de Demorados</h3>
          <p className="text-xl font-bold text-yellow-600">{porcentajeDemorados}%</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center col-span-2">
          <h3 className="text-sm text-gray-500">Estado de Cuenta Corriente</h3>
          <p className="text-xl font-bold text-blue-700">${cliente?.cuentaCorriente?.toLocaleString("es-AR") || 0}</p>
        </div>
      </div>

      <div className="mb-4">
       <ListaEnviosCliente envios={envios} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">💰 Pagos</h3>
        {pagos.map((p) => (
          <TarjetaResumen
            key={p.id}
            titulo={`Método: ${p.metodo}`}
            subtitulo={`Monto: $${p.monto.toLocaleString("es-AR")} – Estado: ${p.estado}`}
          />
        ))}
      </div>
    </div>
  );
}