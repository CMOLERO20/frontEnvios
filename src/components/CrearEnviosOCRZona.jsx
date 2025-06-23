
import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { v4 as uuidv4 } from "uuid";
import OCRMultipleEnvios from "../components/OCRMultipleEnvios";

const obtenerPrecioPorZona = (zona) => {
  switch (zona?.toLowerCase()) {
    case "zona 1":
      return 1400;
    case "zona 2":
      return 1800;
    case "zona 3":
      return 2100;
    case "zona 4":
      return 2500;
    default:
      return 0;
  }
};

export default function CrearEnviosOCRZona() {
  const [enviosOCR, setEnviosOCR] = useState([]);

  const prepararEnvios = (ocrEnvios) => {
    const conZonas = ocrEnvios.map((envio) => ({
      ...envio,
      zona: "",
    }));
    setEnviosOCR(conZonas);
  };

  const actualizarZona = (index, nuevaZona) => {
    const actualizados = [...enviosOCR];
    actualizados[index].zona = nuevaZona;
    setEnviosOCR(actualizados);
  };

  const crearEnvios = async () => {
    const sinZona = enviosOCR.some((envio) => !envio.zona);
    if (sinZona) {
      alert("Todos los envíos deben tener una zona asignada.");
      return;
    }

    try {
      for (const envio of enviosOCR) {
        const precio = obtenerPrecioPorZona(envio.zona);
        const docRef = await addDoc(collection(db, "envios"), {
          ...envio,
          senderId: envio.remitenteId,
          senderName: envio.senderName || "",
          precio,
          activo: true,
          creado: Timestamp.now(),
          estado: "Pendiente",
          motoId: null,
          motoName: "",
          numeroEnvio: "ENV-" + uuidv4().slice(0, 8),
        });

        await addDoc(collection(docRef, "historial"), {
          estado: "Pendiente",
          fecha: Timestamp.now(),
        });
      }
      alert("Envíos creados correctamente");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar los envíos.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Cargar etiquetas y asignar zonas</h1>

      <OCRMultipleEnvios crearEnvios={prepararEnvios} />

      {enviosOCR.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Asignar zona por envío</h2>
          {enviosOCR.map((envio, i) => (
            <div key={i} className="border p-4 rounded bg-gray-100">
              <p className="font-semibold mb-1">Destinatario: {envio.destinatario}</p>
              <p>Dirección: {envio.direccion}</p>
              <label className="block mt-2">Zona:
                <select
                  className="ml-2 border rounded px-2 py-1"
                  value={envio.zona}
                  onChange={(e) => actualizarZona(i, e.target.value)}
                >
                  <option value="">Seleccionar zona</option>
                  <option value="zona 1">Zona 1</option>
                  <option value="zona 2">Zona 2</option>
                  <option value="zona 3">Zona 3</option>
                  <option value="zona 4">Zona 4</option>
                </select>
              </label>
            </div>
          ))}

          <button
            onClick={crearEnvios}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Confirmar y guardar {enviosOCR.length} envíos
          </button>
        </div>
      )}
    </div>
  );
}
