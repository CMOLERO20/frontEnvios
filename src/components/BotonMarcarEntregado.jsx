import React, { useState } from "react";
import EntregarEnvio from "./EntregarEnvio";

export default function BotonMarcarEntregado({ envios, seleccionados, setSeleccionados }) {
  const [envioActivo, setEnvioActivo] = useState(null);

  // Se permite si el envío está "En camino" o "Yendo al domicilio"
  const envioSeleccionado = envios.find((e) => seleccionados.includes(e.id));
  const estadoValido =
    envioSeleccionado &&
    (envioSeleccionado.estado === "Yendo al domicilio" ||
      envioSeleccionado.estado === "En camino" ||
      envioSeleccionado.estado === "Demorado");

  const iniciarEntrega = () => {
    if (!estadoValido || seleccionados.length !== 1) return;
    setEnvioActivo(envioSeleccionado);
  };

  const cerrarModal = () => {
    setEnvioActivo(null);
    setSeleccionados([]);
  };

  return (
    <>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={iniciarEntrega}
        disabled={seleccionados.length !== 1 || !estadoValido}
        title={
          !estadoValido
            ? "Solo se pueden cerrar envíos que estén 'En camino' o 'Yendo al domicilio'"
            : seleccionados.length !== 1
            ? "Seleccioná un único envío para cerrar"
            : ""
        }
      >
        Marcar como entregado
      </button>

      {envioActivo && (
        <EntregarEnvio envio={envioActivo} onClose={cerrarModal} />
      )}
    </>
  );
}