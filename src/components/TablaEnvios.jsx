import { PlusIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import DetalleEnvioModal from "./DetalleEnvioModal";
export default function TablaEnvios({
  envios,
  columnas,
  detalle,
  etiquetas = {},
  seleccionados,
  toggleSeleccionado ,
  accionesPorFila,
}) {
  const [envioActivo, setEnvioActivo] = useState(null);

  return (
    <>
    <div className="overflow-x-auto">
  <table className="min-w-full text-sm border border-gray-200 shadow-sm rounded-lg">
    <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
      <tr>
        {seleccionados && toggleSeleccionado && (
          <th className="px-3 py-2 text-center whitespace-nowrap">✔</th>
        )}

        {columnas.map((col) => (
          <th
            key={col.key}
            className="px-3 py-2 text-left whitespace-nowrap border border-gray-200"
          >
            {col.label}
          </th>
        ))}

        {accionesPorFila && (
          <th className="px-3 py-2 text-center whitespace-nowrap border border-gray-200">
            Acciones
          </th>
        )}

        <th className="px-3 py-2 text-center whitespace-nowrap border border-gray-200">
          Detalle
        </th>
      </tr>
    </thead>

    <tbody className="bg-white divide-y divide-gray-100">
      {envios
        .sort((a, b) => {
          const fechaA = a.creado?.toDate ? a.creado.toDate() : new Date(a.creado);
          const fechaB = b.creado?.toDate ? b.creado.toDate() : new Date(b.creado);
          return fechaB - fechaA;
        })
        .map((envio) => (
          <tr key={envio.id} className="hover:bg-gray-50 transition">
            {seleccionados && toggleSeleccionado && (
              <td className="px-3 py-2 text-center border border-gray-200">
                <input
                  type="checkbox"
                  checked={seleccionados.includes(envio.id)}
                  onChange={() => toggleSeleccionado(envio.id)}
                  className="accent-blue-600"
                />
              </td>
            )}

            {columnas.map((col) => (
              <td
                key={col.key}
                className="px-3 py-2 border border-gray-200 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
              >
                {typeof col.render === "function"
                  ? col.render(envio[col.key], envio)
                  : envio[col.key]}
              </td>
            ))}

            {accionesPorFila && (
              <td className="px-3 py-2 text-center border border-gray-200">
                {accionesPorFila(envio)}
              </td>
            )}

            <td className="px-3 py-2 text-center border border-gray-200">
              <button
                onClick={() => setEnvioActivo(envio)}
                className="text-blue-600 hover:underline transition"
                title="Ver detalle"
              >
                <PlusIcon className="h-5 w-5 text-blue-500 hover:bg-sky-200 rounded-full" />
              </button>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
</div>
      {/* Modal de detalles */}
    {envioActivo && (
  <DetalleEnvioModal envio={envioActivo} onClose={() => setEnvioActivo(null)} />
)}
    </>
  );
}
