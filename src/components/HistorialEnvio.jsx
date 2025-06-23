// components/HistorialEnvio.jsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function HistorialEnvio({ envioId }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      const ref = collection(db, "envios", envioId, "historial");
      const snap = await getDocs(ref);
      const datos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHistorial(
        datos.sort((a, b) => b.fecha?.seconds - a.fecha?.seconds)
      );
      setLoading(false);
    };

    if (envioId) fetchHistorial();
  }, [envioId]);

  if (loading) return <p className="text-sm text-gray-500">Cargando historial...</p>;
  if (historial.length === 0) return <p className="text-sm text-gray-500">Sin movimientos registrados.</p>;

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-md font-semibold mb-2 text-gray-700">Historial de movimientos</h3>
      <ul className="text-sm text-gray-600 space-y-1 max-h-60 overflow-y-auto">
        {historial.map((h) => (
          <li key={h.id} className="border-b py-1">
            <p>
              <span className="font-semibold">{h.estado}</span> –{" "}
              {h.fecha?.toDate().toLocaleString("es-AR", {
                dateStyle: "short",
                timeStyle: "short",
              })}{" "}
              por <span className="italic">{h.usuario}</span>
            </p>
            {h.motivo && (
              <p className="text-xs text-red-500 mt-1">Motivo: {h.motivo}</p>
            )}
            {h.recibidoPor && (
              <p className="text-xs text-green-600 mt-1">
                Recibido por: {h.recibidoPor.nombre} (DNI {h.recibidoPor.dni}, {h.recibidoPor.tipo})
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
