// src/views/MotoDashboard.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth} from "../firebase";
import { Link } from "react-router-dom";
import ContadorEnvios from "../components/ContadorEnvios";
import { TruckIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import TarjetaEnvios from "../components/TarjetaEnvios";
import { getEnviosPorRepartidor } from "../utils/getEnviosPorRepartidor";

export default function MotoDashboard() {
  const [user, setUser] = useState(null);
  const [envios, setEnvios] = useState([]);
  
  

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

 useEffect(() => {
  if (!user) return;

  const unsubscribe = getEnviosPorRepartidor(user.uid, (data) => {
    const activos = data.filter((e) => e.activo === true);
    setEnvios(activos);
  });

  return () => unsubscribe();
}, [user]);

  const activos = envios.filter((e) => e.activo == true);
 

  if (!user) return <p className="p-4">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 lg:px-12">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Bienvenido, repartidor</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
             <ContadorEnvios
          envios={envios}
          estado={["En camino", "Yendo al domicilio",'Pendiente','Demorado']}
          titulo="Envíos activos"
        />
             <ContadorEnvios
          envios={envios}
          estado={[]}
          titulo="Demorados"
          color="text-red-600"
          flagDemorado={true}
        />
      
      </div>

      <h3 className="text-2xl font-extrabold text-gray-800 mb-6">Envíos activos</h3>
   <div className="grid gap-4 mb-6">
  {activos.length === 0 ? (
    <p className="text-gray-500">No tenés envíos activos.</p>
  ) : (
    
        <TarjetaEnvios   envios={activos} />
   
  )}
</div>



 <div className=" p-4 rounded shadow bg-white flex items-center gap-4 hover:bg-gray-50 transition">
  <div className="flex items-center gap-3">
    <CheckCircleIcon className="h-6 w-6 text-green-500" />
    <div>
      <p className="font-semibold text-gray-800">Envíos finalizados</p>
      <Link
    to="/moto/finalizados"
    className="text-sm text-blue-600 hover:underline font-medium"
  >
    Ver Historial de Entregas
  </Link>
    </div>
  </div>
  
</div>
    </div>
  );
}