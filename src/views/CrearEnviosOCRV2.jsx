import React, { useState , useEffect} from "react";
import OCRMultipleEnviosV2 from "../components/OCRMultipleEnviosV2";
import obtenerPrecioPorZona from "../utils/obtenerPrecioPorZona";
import { getClients } from "../utils/getClients";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { crearEnvios } from "../utils/crearEnvio";

export default function CrearEnviosOCR() {
  const [enviosOCR, setEnviosOCR] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [remitenteId, setRemitenteId] = useState("");
  const [senderName, setSenderName] = useState('');
    const [metodoPago, setMetodoPago] = useState(null);

  const navigate = useNavigate();
useEffect(() => {
  const fetchUsuarios = async () => {
    try {const cliente = await getClients();
    setClientes(cliente);
        
    } catch (error) {
        console.log(error)
    }
    
  };
  fetchUsuarios();
}, []);

       const handleRemitenteChange = (e) => {
    const id = e.target.value;
        const usuario = clientes.find((u) => u.id === id);
        setRemitenteId(id);
        setSenderName(usuario?.nombre || "");
  };

  const actualizarZona = (index, nuevaZona) => {
    const actualizados = [...enviosOCR];
    actualizados[index].zona = nuevaZona;
    setEnviosOCR(actualizados);
  };

 const guardarEnvios = async () => {
   const sinZona = enviosOCR.some((envio) => !envio.zona);
   if (sinZona) {
     alert("Todos los envíos deben tener una zona asignada.");
     return;
   }
 
   try {
    await crearEnvios({ enviosOCR, remitenteId, senderName, metodoPago });
    
 
     alert("Envíos creados correctamente");
     navigate("/admin");
   } catch (error) {
     console.error("Error al guardar:", error);
     alert("Error al guardar los envíos.");
   }
 };
const totalPrecio = enviosOCR.reduce((acc, envio) => acc + (envio.precio || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>  <button
    onClick={() => navigate("/admin")}
    className="absolute top-2 left-2 p-1 text-gray-600 hover:text-blue-600 transition"
    title="Volver al dashboard"
  >
    <ArrowLeftIcon className="h-5 w-5" />
  </button></div>
   

    {enviosOCR.length === 0 && (
        <OCRMultipleEnviosV2 setEnvios={setEnviosOCR} />
    )}
   
 

  {enviosOCR.length > 0 && (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
         <div><label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar remitente:</label>
    <select
      className="border border-gray-300 rounded-md p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={remitenteId}
      onChange={handleRemitenteChange}
    >
      <option value="">-- Elegir cliente --</option>
      {clientes.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nombre || c.email}
        </option>
      ))}
    </select></div>

      <div className="mt-6 p-4 bg-gray-100 rounded-md flex justify-between items-center text-sm sm:text-base text-gray-800 shadow-sm">
  
    
  <div>
    <p><span className="font-medium">📦 Total de envíos:</span> {enviosOCR.length}</p>
  </div>
  <div>
    <p><span className="font-medium">💰 Total estimado:</span> ${totalPrecio.toLocaleString("es-AR")}</p>
  </div>

   
     <SelectorMetodoPago onMetodoSeleccionado={(metodo) => setMetodoPago(metodo)} />
</div>
      <h2 className="text-xl font-semibold text-gray-800">Asignar zona por envío</h2>

      {enviosOCR.map((envio, i) => {
  const sinZona = !envio.zona;
  const bgClass = sinZona ? "bg-red-50 border-red-300" : "bg-gray-50 border-gray-200";

  return (
    <div key={i} className={`border p-4 rounded-md ${bgClass}`}>
      <p className="text-gray-800 font-medium">📦 Destinatario: {envio.recieverName}</p>
      <p className="text-gray-700 text-sm">🏠 <strong>Dirección:</strong> {envio.recieverAddress}  <strong>Localidad:</strong>  {envio.localidad}</p>
      <p className="text-gray-700 text-sm">💰<strong> Precio:</strong> ${envio.precio || "-"}</p>

      <label className="block mt-3 text-sm text-gray-700 font-medium">
        Zona:
        <select
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={envio.zona || ""}
          onChange={(e) => {
            const nuevaZona = e.target.value;
            const actualizados = [...enviosOCR];
            actualizados[i].zona = nuevaZona;
            actualizados[i].precio = obtenerPrecioPorZona(nuevaZona);
            setEnviosOCR(actualizados);
          }}
        >
          <option value="">Seleccionar zona</option>
          <option value="CABA">CABA</option>
          <option value="Primer Cordón">Zona 1</option>
          <option value="Segundo Cordón">Zona 2</option>
          <option value="Tercer Cordón">Zona 3</option>
        </select>
      </label>

      {sinZona && (
        <p className="text-red-600 text-xs mt-2">
          ⚠️ Este envío no tiene zona ni precio asignado.
        </p>
      )}
    </div>
  );
})}

      <div className="flex justify-end gap-3">
        <button
          onClick={guardarEnvios}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md transition"
        >
          Confirmar y guardar {enviosOCR.length} envío{enviosOCR.length > 1 && "s"}
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md transition"
          onClick={() => navigate("/admin")}
        >
          Cancelar
        </button>
      </div>
    </div>
  )}
</div>
  );
}