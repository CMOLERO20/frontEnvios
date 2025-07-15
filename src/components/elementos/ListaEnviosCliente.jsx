import { useState } from "react";
import TarjetaResumen from "./TarjetaResumen";

export default function ListaEnviosCliente({ envios }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = envios
    .filter((e) =>
      [e.recieverName, e.localidad, e.estado]
        .some((campo) => campo?.toLowerCase().includes(busqueda.toLowerCase()))
    )
    .slice(0, 5); // solo los primeros 5

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">📦 Envíos</h3>
      <input
        type="text"
        placeholder="Buscar envío..."
        className="mb-2 p-2 border border-gray-300 rounded w-full text-sm"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {filtrados.length === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron envíos.</p>
      ) : (
        filtrados.map((e) => (
          <TarjetaResumen
            key={e.id}
            titulo={`Destinatario: ${e.recieverName}`}
            subtitulo={`Estado: ${e.estado} – ${e.localidad}`}
          />
        ))
      )}
    </div>
  );
}