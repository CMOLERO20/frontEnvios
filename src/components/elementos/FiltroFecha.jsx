import React from "react";

export default function FiltroFecha({ fechaDesde, fechaHasta, setFechaDesde, setFechaHasta }) {
  return (
    <div className="flex gap-4 mb-4">
      <div>
        <label className="text-sm text-gray-700 block">Desde</label>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="border border-gray-300 rounded p-2"
        />
      </div>
      <div>
        <label className="text-sm text-gray-700 block">Hasta</label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="border border-gray-300 rounded p-2"
        />
      </div>
    </div>
  );
}