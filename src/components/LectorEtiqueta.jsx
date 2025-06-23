import React, { useState } from "react";

export default function LectorOCR_Google() {
  const [archivo, setArchivo] = useState(null);
  const [texto, setTexto] = useState("");
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArchivo(URL.createObjectURL(file));
    setCargando(true);
    setTexto("");
    setDatos(null);

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const res = await fetch("http://localhost:4000/ocr", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      setTexto(json.texto || "");
      setDatos(json.datos || {});
    } catch (err) {
      console.error("Error:", err);
      alert("Hubo un problema al procesar el archivo.");
    }

    setCargando(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Lector OCR con Google Vision</h2>

      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />

      {archivo && (
        <div className="mb-4">
          <iframe
            src={archivo}
            title="Archivo"
            className="w-full h-64 border"
          ></iframe>
        </div>
      )}

      {cargando && <p>Procesando archivo...</p>}

      {datos && (
        <div className="bg-gray-100 p-4 rounded shadow mt-4">
          <h3 className="font-semibold mb-2">Datos extraídos:</h3>
          {Object.entries(datos).map(([key, value]) => (
            <p key={key}>
              <b>{key}:</b> {value}
            </p>
          ))}
        </div>
      )}

      {texto && (
        <details className="mt-4">
          <summary className="cursor-pointer text-blue-600 underline">
            Ver texto OCR completo
          </summary>
          <pre className="mt-2 whitespace-pre-wrap text-sm">{texto}</pre>
        </details>
      )}
    </div>
  );
}