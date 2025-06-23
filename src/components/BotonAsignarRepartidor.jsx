import React, { useState, useEffect } from "react";
import { doc, updateDoc, collection, getDocs, where , query} from "firebase/firestore";
import { db } from "../firebase";
import registrarCambioEstado from "../utils/registrarCambioEstado";

export default function BotonAsignarRepartidor({ enviosSeleccionados, setSeleccionados , envios }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [motos, setMotos] = useState([]);
  const [motoSeleccionada, setMotoSeleccionada] = useState("");

   const puedeAsignarRepartidor = envios
    .filter((e) => enviosSeleccionados.includes(e.id))
    .every((e) => e.estado === "Pendiente");

  // Traer motos desde Firestore
  useEffect(() => {
    const fetchMotos = async () => {
      try {
       const q = query(collection(db, "usuarios"), where("role", "==", "moto"));
const querySnapshot = await getDocs(q);
        const motosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMotos(motosData);
      } catch (error) {
        console.error("Error cargando motos:", error);
      }
    };

    if (modalOpen) {
      fetchMotos();
    }
  }, [modalOpen]);

  const abrirModal = () => {
    if (enviosSeleccionados.length === 0) return;
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setMotoSeleccionada("");
    setModalOpen(false);
  };

 const asignarMoto = async () => {
  if (!motoSeleccionada) return;

  const updates = enviosSeleccionados.map(async (id) => {
    const envioRef = doc(db, "envios", id);

    // 1. Asignar la moto (sin cambiar estado acá)
    await updateDoc(envioRef, {
      motoId: motoSeleccionada,
      motoName: motos.find((m) => m.id === motoSeleccionada)?.email || "",
    });

    // 2. Registrar cambio de estado
    await registrarCambioEstado(id, "En camino");
  });

  await Promise.all(updates);
  setSeleccionados([]);
  cerrarModal();
};

  return (
    <>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={abrirModal}
        disabled={enviosSeleccionados.length === 0 || !puedeAsignarRepartidor}
      >
        Asignar repartidor
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-50  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Asignar repartidor</h3>

            <select
              className="w-full border p-2 mb-4"
              value={motoSeleccionada}
              onChange={(e) => setMotoSeleccionada(e.target.value)}
            >
              <option value="">Seleccionar moto</option>
              {motos.map((moto) => (
                <option key={moto.id} value={moto.id}>
                  {moto.email}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={asignarMoto}
                disabled={!motoSeleccionada}
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}