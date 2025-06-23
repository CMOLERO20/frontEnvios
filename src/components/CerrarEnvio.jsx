// components/CerrarEnvio.jsx
import React, { useState } from "react";
import EntregarEnvio from "./EntregarEnvio";
import DemorarEnvio from "./DemorarEnvio";

export default function CerrarEnvio({ envio }) {
  const [opcion, setOpcion] = useState(null);
  const [abierto, setAbierto] = useState(false);

  const cerrarTodo = () => {
    setOpcion(null);
    setAbierto(false);
  };

  return (
    <>
     <button
  onClick={() => setAbierto(true)}
  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm rounded-md shadow transition"
>
  Cerrar envío
</button>

{abierto && !opcion && (
  <div className="fixed inset-0 bg-gray-50 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative animate-fade-in">
      {/* Cierre */}
      <button
        onClick={cerrarTodo}
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-800 text-2xl"
      >
        &times;
      </button>

      {/* Título */}
      <h2 className="text-xl font-bold text-gray-800 mb-5 text-center">
        ¿Cómo querés cerrar el envío?
      </h2>

      {/* Botones */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setOpcion("entregar")}
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-700 text-white px-4 py-3 rounded-md transition shadow-md"
        >
          ✅ Pude entregar
        </button>
        <button
          onClick={() => setOpcion("demorar")}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md transition shadow-md"
        >
          ❌ No pude entregar
        </button>
      </div>
    </div>
  </div>
)}

      {opcion === "entregar" && (
        <EntregarEnvio envio={envio} onClose={cerrarTodo} />
      )}
      {opcion === "demorar" && (
        <DemorarEnvio envio={envio} onClose={cerrarTodo} />
      )}
    </>
  );
}
