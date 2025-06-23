

import React, { useState } from "react";
import { CameraIcon } from "@heroicons/react/24/solid";
import asignarZonaPorLocalidad from "../utils/asignarZonaPorLocalidad";
import obtenerPrecioPorZona from "../utils/obtenerPrecioPorZona";
const ocrUrl = import.meta.env.VITE_OCR_URL
export default function OCRMultipleEnvios({ setEnvios }) {
  const [cargando, setCargando] = useState(false);

  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    setCargando(true);

    const procesados = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("archivo", file);

        try {
          const res = await fetch(ocrUrl, {
            method: "POST",
            body: formData,
          });
          const json = await res.json();

          const localidad = json.datos?.localidad || "";
          const zona = asignarZonaPorLocalidad(localidad);
          const precio = obtenerPrecioPorZona(zona)

          return {
            nombre: file.name,
            datos: {
              ...json.datos,
              zona,
              precio,
              nombreArchivo: file.name,
              flex: true,
            },
            error: false,
          };
        } catch (err) {
          return {
            nombre: file.name,
            error: true,
            mensaje: "Error procesando archivo",
          };
        }
      })
    );


    const enviosLimpios = procesados.filter((r) => !r.error).map((r) => r.datos);
    setEnvios(enviosLimpios);
    setCargando(false);
  };

  return (
 <div className="p-6 bg-white rounded-md shadow-md border border-gray-200">
  <h2 className="text-lg font-semibold text-gray-800 mb-3">📎 Subir etiquetas escaneadas</h2>
   <label className="flex items-center justify-center gap-2 cursor-pointer border border-gray-300 bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition">
        <CameraIcon className="h-5 w-5 text-gray-600" />
        <span className="text-gray-700 text-sm">
          Tocá para usar la cámara o subir una foto de etiqueta
        </span>
        <input
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          multiple
          onChange={handleFilesUpload}
          className="hidden"
        />
      </label>

  {cargando && (
    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
      <svg
        className="animate-spin mr-2 h-5 w-5 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Procesando archivos, por favor esperá...
    </div>
  )}
</div>
  );
}