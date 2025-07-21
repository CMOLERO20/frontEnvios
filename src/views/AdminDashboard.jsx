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
import TarjetaMenu from "../components/TarjetaMenu";
import TablaAdmin from "../components/material/TablaAdmin";
import { Tab } from "@mui/material";
import { getEnvios } from "../utils/getEnvios";
import BotonAsignarRepartidorM from "../components/material/BotonAsignarRepartidor";
import ModalEditarEnvio from "../components/material/ModalEditarEnvio";

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
const acciones = [

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

const categorias = [
  {
    nombre: "Ver Envíos",
    ruta: '/admin/envios',
  },
  {
    nombre: "Crear Envíos",
    subrutas: [
      { label: "Manual", ruta: "/admin/crear-multiples" },
      { label: "Foto", ruta: "/admin/crear-envios-ocr" },
      { label: "Cámara", ruta: "/admin/crear-envios-ocr-v2" },
    ],
  },
  {
    nombre: "Clientes",
    subrutas: [
      { label: "Crear Cliente", ruta: "/crear-cliente" },
      { label: "Ver Clientes", ruta: "/admin/clientes" },
    ],
  },
  
  {
    nombre: "Pagos",
    subrutas: [
      { label: "Registrar Pago", ruta: "/admin/pagos/registro" },
      { label: "Ver Pagos", ruta: "/admin/pagos/" },
    ],
  },
  {
    nombre: "Motos",
    subrutas: [
      { label: "Asignar Envíos", ruta: "/admin/motos/asignar" },
      { label: "Registrar Repartidor", ruta: "/admin/motos/registrar" },
      { label: "Envíos por Repartidor", ruta: "/admin/motos/envios" },
    ],
  },
];
export default function AdminDashboard() {
  const [envios, setEnvios] = useState([]);
  const [enviosFiltrados, setEnviosFiltrados] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [envioAEditar, setEnvioAEditar] = useState(null);


   const fetchData = async () => {
        const data = await getEnvios();
        setEnvios(data);
      };
   useEffect(() => {
     
      fetchData();
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

 <TarjetaMenu categorias={categorias} />
  {/* Botones de acciones */}
    <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Acciones</h1>
  <div className="flex flex-wrap gap-3 items-center mb-6">
  <BotonAsignarRepartidorM
  enviosSeleccionados={seleccionados}
  setSeleccionados={setSeleccionados}
  envios={envios}
  onActualizar={fetchData}
/>

  <BotonMarcarEntregado
    envios={envios}
    seleccionados={seleccionados}
    setSeleccionados={setSeleccionados}
  />
</div>
{envios.length === 0 ? (
  <p>Cargando envíos...</p>
) : ( 
  <TablaAdmin   onUpdate={() => {
    fetchData(); // Refrescar los datos // Cerrar modal
  }}  envios={envios}  onEditar={(envio) => setEnvioAEditar(envio)}
     onSeleccionar={(seleccionados) => setSeleccionados(seleccionados)}  enviosSeleccionados={seleccionados}/>
)}
<ModalEditarEnvio
  envio={envioAEditar}
  open={!!envioAEditar}
  onClose={() => setEnvioAEditar(null)}
  onUpdate={() => {
    fetchData(); // Refrescar los datos
    setEnvioAEditar(null); // Cerrar modal
  }}
/>
</div>

  );
}