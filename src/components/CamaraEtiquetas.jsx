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
    const previewUrl = URL.createObjectURL(blob);

    const nuevas = [...imagenes, { blob, previewUrl }];
    setImagenes(nuevas);
    onFotosCapturadas(nuevas);
  };

  const eliminarFoto = (index) => {
    const nuevas = imagenes.filter((_, i) => i !== index);
    setImagenes(nuevas);
    onFotosCapturadas(nuevas);
  };

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        {error && (
          <p className="absolute top-0 left-0 right-0 text-center text-red-500 bg-white py-2 text-sm">
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={capturarFoto}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
        >
          📸 Capturar Foto
        </button>
      </div>

      {imagenes.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {imagenes.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img.previewUrl}
                alt={`foto-${idx}`}
                className="w-full h-auto rounded border"
              />
              <button
                onClick={() => eliminarFoto(idx)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}