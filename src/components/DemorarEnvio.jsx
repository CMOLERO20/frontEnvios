// components/DemorarEnvio.jsx
import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import registrarCambioEstado from "../utils/registrarCambioEstado";

export default function DemorarEnvio({ envio, onClose }) {
  const [motivo, setMotivo] = useState("No había nadie en el domicilio");
  const [guardando, setGuardando] = useState(false);

  const motivos = [
    "No había nadie en el domicilio",
    "Problemas técnicos"
  ];

  const confirmarDemora = async () => {
    setGuardando(true);


    await registrarCambioEstado(envio.id, "Demorado", { demorado: true , motivo: motivo });

    await updateDoc(doc(db, "envios", envio.id), {
      estado: "Demorado",
      motivoDemora: motivo,
    });

    setGuardando(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 hover:text-black text-lg"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4">Marcar como demorado</h2>

        <div className="space-y-3 text-sm">
          <label className="block font-medium">Motivo</label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="border p-2 w-full"
          >
            {motivos.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-right">
          <button
            disabled={guardando}
            onClick={confirmarDemora}
            className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Confirmar demora"}
          </button>
        </div>
      </div>
    </div>
  );
}
