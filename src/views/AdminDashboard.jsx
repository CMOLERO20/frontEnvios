import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
 
} from "firebase/firestore";
import BotonMarcarEntregado from "../components/BotonMarcarEntregado";
import BotonAsignarRepartidor from "../components/BotonAsignarRepartidor";
import BotonCrearEnvio from "../components/BotonCrearEnvio";
import FiltrosEnvios from "../components/FiltrosEnvios";
import formatearFecha from "../utils/formatearFecha";
import TablaEnvios from "../components/TablaEnvios";
import ContadorEnvios from "../components/ContadorEnvios";
import { RegistrarCliente } from "../components/RegistrarUsuario";
import { useNavigate } from "react-router-dom";


const columnas = [
  
  { key: "recieverName", label: "Destinatario" },
  { key: "recieverAddress", label: "Destino" },
  {
    key: "creado",
    label: "Fecha",
    render: (v) => formatearFecha(v),
  },
  { key: "localidad", label: "Localidad" },
  { key: "zona", label: "Zona" },
  { key: "estado", label: "Estado" },
  {
    key: "motoName",
    label: "Repartidor",
    render: (v) =>
      v ? v : <span className="text-gray-400 italic">Sin asignar</span>,
  },
];

const detalle = [
  "estado",
  "recieverName",
  "recieverAddress",
  "zona",
  "numeroEnvio",
  "creado",
  "senderName",
  "motoName",
];

const etiquetas = {
  estado: "Estado",
  recieverName: "Receptor",
  motoName: "Repartidor",
  numeroEnvio: "N° de Envío",
  zona: "Zona",
  creado: "Fecha de Creación",
  senderName: "Remitente",
  recieverAddress: "Dirección de Entrega",
};


export default function AdminDashboard() {
  const [envios, setEnvios] = useState([]);
  const [enviosFiltrados, setEnviosFiltrados] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

   const navigate = useNavigate();
  useEffect(() => {
    const q = query(collection(db, "envios"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEnvios(data);
    });
    return () => unsub();
  }, []);
  useEffect(() => {
  const unsub = onSnapshot(collection(db, "envios"), (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setEnvios(data);
  });
  return () => unsub();
}, []);

 
  
  const toggleSeleccionado = (id) => {
  setSeleccionados((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};
 

  return (
   <div className="min-h-screen bg-gray-50 py-8 px-6 lg:px-12">
  <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Gestión de Envíos</h2>

  {/* Contadores */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 ">
    <ContadorEnvios
      envios={envios}
      estado={["En camino", "Yendo al domicilio", "Pendiente", "Demorado"]}
      titulo="Envíos activos"
    />
    <ContadorEnvios
      envios={envios}
      estado="Pendiente"
      titulo="Pendientes"
        color='text-yellow-500'
    />
    <ContadorEnvios
      envios={envios}
      estado={["En camino", "Yendo al domicilio"]}
      titulo="En viaje"
      color='text-indigo-500'
    />
    
    <ContadorEnvios
      envios={envios}
      estado={[]}
      titulo="Demorados"
      color="text-red-600"
    />
  </div>

  {/* Botones de acciones */}
    <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Acciones</h1>
  <div className="flex flex-wrap gap-3 items-center mb-6">
  
  <button
    onClick={() => navigate("/crear-cliente")}
    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
  >
    Crear Cliente
  </button>
<button
    onClick={() => navigate("/admin/crear-envios-ocr")}
    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
  >
    Lector de Etiquetas
  </button>
  <button
    onClick={() => navigate("/admin/crear-envios-ocr-v2")}
    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
  >
    Lector de Etiquetas V2
  </button>
  <button
    onClick={() => navigate("/admin/crear-multiples")}
    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition"
  >
    Crear múltiples envíos
  </button>

  <BotonAsignarRepartidor
    enviosSeleccionados={seleccionados}
    setSeleccionados={setSeleccionados}
    envios={envios}
  />

  <BotonMarcarEntregado
    envios={envios}
    seleccionados={seleccionados}
    setSeleccionados={setSeleccionados}
  />
</div>

  {/* Filtros */}
  <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Filtros</h1>
  <div >
    <FiltrosEnvios envios={envios} onFiltrar={setEnviosFiltrados} />
  </div>

  {/* Tabla */}
  <div className="overflow-x-auto bg-white rounded shadow mt-6">
    <TablaEnvios
      envios={enviosFiltrados}
      columnas={columnas}
      detalle={detalle}
      etiquetas={etiquetas}
      seleccionados={seleccionados}
      toggleSeleccionado={toggleSeleccionado}
    />
  </div>
</div>

  );
}