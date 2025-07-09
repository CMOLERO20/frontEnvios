import React, { useEffect, useState } from "react";
import  obtenerOrientacionPorLocalidad  from '../utils/obtenerOrientacionPorLocalidad';

export default function FiltrosEnvios({
  envios,
  onFiltrar,
  showEstado = true,
  showRemitente = true,
  showDireccion = false,
}) {
  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [remitente, setRemitente] = useState("");
  const [direccion, setDireccion] = useState("");
  const [cantidad, setCantidad] = useState(0);
 const [soloDemorados, setSoloDemorados] = useState(false);
 const [orientacion, setOrientacion] = useState("");

  const limpiarFiltros = () => {
    setEstado("");
    setDesde("");
    setHasta("");
    setRemitente("");
    setDireccion("");
  };

 useEffect(() => {
  let filtrados = [...envios];

  if (showEstado && estado) {
    filtrados = filtrados.filter((e) => e.estado === estado);
  }

  if (showRemitente && remitente) {
    filtrados = filtrados.filter((e) =>
      e.senderName?.toLowerCase().includes(remitente.toLowerCase())
    );
  }

  if (showDireccion && direccion) {
    filtrados = filtrados.filter((e) =>
      e.recieverAddress?.toLowerCase().includes(direccion.toLowerCase())
    );
  }

  if (desde) {
    const d = new Date(desde);
    filtrados = filtrados.filter((e) => e.creado?.toDate() >= d);
  }

  if (hasta) {
    const h = new Date(hasta);
    filtrados = filtrados.filter((e) => e.creado?.toDate() <= h);
  }

  if (soloDemorados) {
    filtrados = filtrados.filter((e) => e.demorado === true);
  }
  if (orientacion) {
  filtrados = filtrados.filter((e) => {
    const ori = e.orientacion || obtenerOrientacionPorLocalidad(e.localidad);
    return ori === orientacion;
  });
}

  setCantidad(filtrados.length);
  onFiltrar(filtrados);
}, [estado, desde, hasta, remitente, direccion, envios, soloDemorados, orientacion]);

  return (
  <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
    {showEstado && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En camino">En camino</option>
          <option value="Entregado">Entregado</option>
          <option value="Demorado">Demorado</option>
        </select>
      </div>
    )}

    <div className="flex items-center mt-1">
      <label htmlFor="demorado-toggle" className="mr-2 text-sm text-gray-700">
        Solo demorados
      </label>
      <input
        id="demorado-toggle"
        type="checkbox"
        checked={soloDemorados}
        onChange={(e) => setSoloDemorados(e.target.checked)}
        className="hidden"
      />
      <div
        className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition ${
          soloDemorados ? "bg-yellow-500" : ""
        }`}
        onClick={() => setSoloDemorados(!soloDemorados)}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
            soloDemorados ? "translate-x-5" : ""
          }`}
        ></div>
      </div>
    </div>
    <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Orientación</label>
  <select
    value={orientacion}
    onChange={(e) => setOrientacion(e.target.value)}
    className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
  >
    <option value="">Todas</option>
    <option value="Norte">Norte</option>
    <option value="Sur">Sur</option>
    <option value="Oeste">Oeste</option>
    <option value="Centro">Centro</option>
  </select>
</div>
  {showRemitente && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Remitente</label>
        <input
          type="text"
          value={remitente}
          onChange={(e) => setRemitente(e.target.value)}
          placeholder="Nombre"
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    )}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
      <input
        type="date"
        value={desde}
        onChange={(e) => setDesde(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
      <input
        type="date"
        value={hasta}
        onChange={(e) => setHasta(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>

   

    {showDireccion && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Buscar por dirección"
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    )}

    <div className="flex items-end">
      <button
        onClick={limpiarFiltros}
        className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition font-medium text-sm"
      >
        Limpiar
      </button>
    </div>
  </div>

  <p className="text-sm text-gray-600">
    Mostrando <strong>{cantidad}</strong> envío{cantidad !== 1 && "s"} filtrado{cantidad !== 1 && "s"}.
  </p>
</div>
  );
}