import { useEffect, useRef, useState } from "react";

export default function CamaraEtiquetas({ onFotosCapturadas }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imagenes, setImagenes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const iniciarCamara = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        setError("No se pudo acceder a la cámara.");
        console.error(err);
      }
    };

    iniciarCamara();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturarFoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );

    if (!blob) return;

    const previewUrl = URL.createObjectURL(blob);

    const nuevaImagen = { blob, previewUrl };
    const nuevas = [...imagenes, nuevaImagen];
    setImagenes(nuevas);
    onFotosCapturadas(nuevas); // envia array de { blob, previewUrl }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold text-gray-800 mb-2">Capturar fotos de etiquetas</h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="relative w-full aspect-video rounded overflow-hidden border mb-3">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={capturarFoto}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Capturar Foto
        </button>
        <span className="text-sm text-gray-700">Fotos tomadas: {imagenes.length}</span>
      </div>

      {imagenes.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {imagenes.map((img, idx) => (
            <img key={idx} src={img.previewUrl} alt={`captura-${idx}`} className="w-full h-auto rounded border" />
          ))}
        </div>
      )}
    </div>
  );
}