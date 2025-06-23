import { TruckIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import CerrarEnvio from "./CerrarEnvio";
import registrarCambioEstado from "../utils/registrarCambioEstado";

const estadoStyles = {
  "En camino": {
    color: "text-blue-600",
    icon: <TruckIcon className="w-5 h-5 text-blue-600" />,
    label: "En camino",
  },
  "Yendo al domicilio": {
    color: "text-green-600",
    icon: <TruckIcon className="w-5 h-5 text-green-600" />,
    label: "Yendo al domicilio",
  },
  "Demorado": {
    color: "text-yellow-600",
    icon: <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />,
    label: "Demorado",
  },
};

export default function TarjetaEnvios({ envios }) {
  if (!envios || envios.length === 0) {
    return <p className="text-gray-500">No tenés envíos para mostrar.</p>;
  }

  return (
    <div className="grid gap-4">
      {envios.map((envio) => {
        const estado = estadoStyles[envio.estado] || {
          color: "text-gray-600",
          icon: null,
          label: envio.estado,
        };

        return (
          <div
            key={envio.id}
            className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                {estado.icon}
                <p className={`text-sm font-medium ${estado.color}`}>
                  {estado.label}
                </p>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Destinatario:</strong> {envio.recieverName}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Dirección:</strong> {envio.recieverAddress}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Teléfono:</strong> {envio.recieverPhone}
              </p>
            </div>

            <div className="flex gap-2">
              {envio.estado === "Yendo al domicilio" && (
                <CerrarEnvio envio={envio} />
              )}

              {envio.estado === "En camino" && (
                <button
                  onClick={() =>
                    registrarCambioEstado(envio.id, "Yendo al domicilio")
                  }
                  className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition"
                >
                  Ir al domicilio
                </button>
              )}

              {envio.estado === "Demorado" && (
                <button
                  onClick={() =>
                    registrarCambioEstado(envio.id, "En camino")
                  }
                  className="bg-yellow-500 text-white px-3 py-1 text-sm rounded hover:bg-yellow-600 transition"
                >
                  Reintentar entrega
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}