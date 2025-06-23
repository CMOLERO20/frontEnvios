import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import formatearFecha from "../utils/formatearFecha";
import { Link } from "react-router-dom";
import FiltrosEnvios from "../components/FiltrosEnvios";
import TablaEnvios from "../components/TablaEnvios";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

const columnas = [
  {
    key: "numeroEnvio",
    label: "N° Envío",
  },
  {
    key: "recieverName",
    label: "Destinatario",
  },
  {
    key: "recieverAddress",
    label: "Dirección",
  },
  {
    key: "creado",
    label: "Fecha",
    render: (valor) => formatearFecha(valor),
  },
];

export default function MotoFinalizados() {
  const [user, setUser] = useState(null);
  const [envios, setEnvios] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [envioActivo, setEnvioActivo] = useState([])

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "envios"),
      where("motoId", "==", user.uid),
      where("estado", "==", "Entregado")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEnvios(data);
    });
    return () => unsub();
  }, [user]);

  if (!user) return <p className="p-4">Cargando usuario...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
     <div className="mb-6">
  <Link
    to="/moto"
    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition"
  >
    <ArrowLeftIcon className="h-5 w-5 mr-1" />
    Volver al panel
  </Link>
</div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Envíos entregados</h2>
        <FiltrosEnvios
  envios={envios}
  onFiltrar={setFiltrados}
  showEstado={false}
  showRemitente={false}
  showDireccion={true}
/>

      {envios.length === 0 ? (
        <p>No hay envíos entregados.</p>
      ) : (
        <div>
       
<TablaEnvios
  envios={envios}
  columnas={columnas}
  detalle={(envio) => (
    <button
      onClick={() => setEnvioActivo(envio)}
      className="text-blue-600 font-semibold hover:underline transition"
      title="Ver detalle"
    >
      <PlusIcon className="h-5 w-5" />
    </button>
  )}
/>
        </div>
      )}
    </div>
  );
  
}