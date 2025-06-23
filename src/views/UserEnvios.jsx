import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot , doc,updateDoc} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

import BotonCrearEnvio from "../components/BotonCrearEnvio";
import TablaEnvios from "../components/TablaEnvios";
import formatearFecha from "../utils/formatearFecha";

const columnas = [
  { key: "recieverName", label: "Destinatario" },
  { key: "recieverAddress", label: "Dirección" },
  { key: "estado", label: "Estado" },
  {
    key: "creado",
    label: "Fecha",
    render: (v) => formatearFecha(v),
  },
];

const detalle = [
  "estado",
  "recieverName",
  "recieverPhone",
  "recieverAddress",
  "zona",
  "numeroEnvio",
  "creado",
];

const etiquetas = {
  estado: "Estado",
  recieverName: "Destinatario",
  recieverPhone: "Teléfono",
  recieverAddress: "Dirección",
  zona: "Zona",
  numeroEnvio: "N° de Envío",
  creado: "Fecha de creación",
};

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [envios, setEnvios] = useState([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "envios"), where("senderId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEnvios(data);
    });
    return () => unsub();
  }, [user]);

  if (!user) return <p className="p-4">Cargando...</p>;
  const cancelarEnvio = async (id) => {
  if (!window.confirm("¿Seguro que querés cancelar este envío?")) return;
  await updateDoc(doc(db, "envios", id), { estado: "Cancelado" });
};

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Tus Envíos</h2>

      <div className="mb-6">
        <BotonCrearEnvio />
      </div>

      <TablaEnvios
        envios={envios}
        columnas={columnas}
        detalle={detalle}
        etiquetas={etiquetas}
        seleccionados={[]} // sin selección en vista user
        toggleSeleccionado={() => {}}
         accionesPorFila={(envio) =>
    envio.estado === "Pendiente" ? (
      <button
        onClick={() => cancelarEnvio(envio.id)}
        className="text-red-600 underline text-sm"
      >
        Cancelar
      </button>
    ) : null
  }
      />
    </div>
  );
}