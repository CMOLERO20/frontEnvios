import React, { useState } from "react";
import registrarCambioEstado from "../utils/registrarCambioEstado";
export default function EntregarEnvio({ envio, onClose }) {
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [tipo, setTipo] = useState("Comprador");
  const [guardando, setGuardando] = useState(false);

  const puedeEntregar = nombre.trim() && dni.trim() && tipo;

  const confirmarEntrega = async () => {
    if (!puedeEntregar) return;
    setGuardando(true);
    await registrarCambioEstado(envio.id, "Entregado",{recibidoPor: { nombre, dni, tipo }, activo:false});
 
    setGuardando(false);
    onClose(); // cerrar al confirmar
  };

  return (
   <div className="fixed inset-0 bg-gray-100 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative animate-fade-in">
    {/* Botón de cierre */}
    <button
      onClick={onClose}
      className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
    >
      &times;
    </button>

    {/* Título */}
    <h2 className="text-xl font-bold text-gray-800 mb-5 text-center">
      Confirmar entrega
    </h2>

    {/* Formulario */}
    <div className="space-y-4 text-sm">
      <input
        type="text"
        placeholder="Nombre de quien recibe"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
      <input
        type="text"
        placeholder="DNI"
        value={dni}
        onChange={(e) => setDni(e.target.value)}
        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
      >
        <option value="Comprador">Comprador</option>
        <option value="Autorizado">Autorizado</option>
      </select>
    </div>

    {/* Botón de acción */}
    <div className="mt-6 text-right">
      <button
        disabled={!puedeEntregar || guardando}
        onClick={confirmarEntrega}
        className="bg-green-600 hover:bg-green-700 transition text-white font-medium px-4 py-2 rounded-md shadow disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Confirmar entrega"}
      </button>
    </div>
  </div>
</div>
  );
}