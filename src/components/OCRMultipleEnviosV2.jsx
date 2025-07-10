import React, { useState } from "react";
import { CameraIcon } from "@heroicons/react/24/solid";
import asignarZonaPorLocalidad from "../utils/asignarZonaPorLocalidad";
import obtenerPrecioPorZona from "../utils/obtenerPrecioPorZona";
import CamaraEtiquetas from "./CamaraEtiquetas";

const ocrUrl = import.meta.env.VITE_OCR_URL;

export default function OCRMultipleEnvios({ setEnvios }) {
  const [imagenes, setImagenes] = useState([]); // [{ blob, previewUrl }]
  const [cargando, setCargando] = useState(false);

  const procesarFotos = async () => {
    if (imagenes.length === 0) return alert("No hay imágenes para procesar.");

    setCargando(true);

    const procesados = await Promise.all(
      imagenes.map(async ({ blob }) => {
        const formData = new FormData();
        formData.append("archivo", blob);

        try {
          const res = await fetch(ocrUrl, {
            method: "POST",
            body: formData,
          });
          const json = await res.json();

          const localidad = json.datos?.localidad || "";
          const zona = asignarZonaPorLocalidad(localidad);
          const precio = obtenerPrecioPorZona(zona);

          return {
            datos: {
              ...json.datos,
              zona,
              precio,
              flex: true,
               imagenBlob: blob,
            },
            error: false,
          };
        } catch (err) {
          console.error("Error OCR:", err);
          return { error: true };
        }
      })
    );

    const enviosLimpios = procesados
      .filter((r) => !r.error)
      .map((r) => r.datos);

    setEnvios(enviosLimpios);
    setCargando(false);
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md border border-gray-200">
    

      <CamaraEtiquetas onFotosCapturadas={setImagenes} />

      <button
        onClick={procesarFotos}
        disabled={imagenes.length === 0 || cargando}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
      >
        {cargando ? "Procesando..." : "Procesar Imágenes"}
      </button>

      {cargando && (
        <p className="mt-2 text-sm text-blue-600 font-medium">
          Procesando imágenes, por favor esperá...
        </p>
      )}
    </div>
  );
}