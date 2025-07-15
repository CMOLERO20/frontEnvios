import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import obtenerPrecioPorZona from "../utils/obtenerPrecioPorZona";
import localidades from "../utils/localidades";
import { getClients } from "../utils/getClients";
import Spinner from "./Spinner";
import SelectorMetodoPago from "../components/SelectorMetodoPago";
import { crearEnvios } from "../utils/crearEnvio";

export default function CrearEnviosMultiples() {
const [usuarios, setUsuarios] = useState([]);
const [guardando, setGuardando] = useState(false);
const [mensaje, setMensaje] = useState(null);
const [remitenteId, setRemitenteId] = useState('');
const [senderName, setSenderName] = useState('')
const [envios, setEnvios] = useState([]);
  const [metodoPago, setMetodoPago] = useState('');
const [form, setForm] = useState({
recieverName: "",
recieverDni: "",
recieverPhone: "",
recieverAddress: "",
localidad: "",
zona: "",
});

const navigate = useNavigate();

useEffect(() => {
const fetchUsuarios = async () => {
 try {const cliente = await getClients();
    setUsuarios(cliente);
        
    } catch (error) {
        console.log(error)
    }
};
fetchUsuarios();
}, []);

const handleChange = (e) => {
const { name, value } = e.target;
setForm((prev) => ({
...prev,
[name]: value,
zona: name === "localidad" ? localidades[value] || "" : prev.zona,
}));
};

const agregarEnvio = () => {
if (!form.recieverName || !form.recieverAddress || !form.localidad || !form.zona) {

return alert("Faltan campos obligatorios del destinatario o destino.");
}


const nuevoEnvio = {
  ...form,
  precio: obtenerPrecioPorZona(form.zona),
};

setEnvios((prev) => [...prev, nuevoEnvio]);
console.log("Nuevo envío agregado:", envios);
setForm({
  recieverName: "",
  recieverDni: "",
  recieverPhone: "",
  recieverAddress: "",
  localidad: "",
  zona: "",
  flex: false,
});
};

const guardarEnvios = async () => {
  if (!remitenteId || envios.length === 0) {
    setMensaje({ tipo: "error", texto: "Seleccioná un remitente y agregá al menos un envío." });
    return;
  }

  try {
    setGuardando(true);
    
    await crearEnvios({ enviosOCR: [...envios], remitenteId, senderName, metodoPago });

  
    setMensaje({ tipo: "ok", texto: "Envíos creados correctamente ✅" });
    setTimeout(() => navigate("/admin"), 2000);
  } catch (error) {
    console.error("Error al crear envíos:", error);
    setMensaje({ tipo: "error", texto: "Hubo un error al crear los envíos." });
  } finally {
    setGuardando(false);
  }
};

return (
<div className="max-w-3xl mx-auto p-4">
  <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Múltiples Envíos</h2>

  {/* Parte 1 - Remitente */}
  <div className="mb-6">
    <label className="block font-medium text-gray-700 mb-1">Remitente</label>
    <select
      className="border border-gray-300 rounded p-2 w-full"
      value={remitenteId}
      onChange={(e) => {
        const id = e.target.value;
        const usuario = usuarios.find((u) => u.uid === id);
        setRemitenteId(id);
        setSenderName(usuario?.nombre || "");
      }}
    >
      <option value="">Seleccionar remitente</option>
      {usuarios.map((u) => (
        <option key={u.id} value={u.uid}>
          {u.nombre} ({u.email})
        </option>
      ))}
    </select>
  </div>

  {/* Parte 2 y 3 - Destinatario y Destino */}
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
    <div>
      <label className="block text-gray-700 font-medium">Nombre y Apellido*</label>
      <input
        name="recieverName"
        className="border border-gray-300 rounded p-2 w-full"
        value={form.recieverName}
        onChange={handleChange}
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium">DNI</label>
      <input
        name="recieverDni"
        className="border border-gray-300 rounded p-2 w-full"
        value={form.recieverDni}
        onChange={handleChange}
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium">Teléfono*</label>
      <input
        name="recieverPhone"
        className="border border-gray-300 rounded p-2 w-full"
        value={form.recieverPhone}
        onChange={handleChange}
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium">Domicilio*</label>
      <input
        name="recieverAddress"
        className="border border-gray-300 rounded p-2 w-full"
        value={form.recieverAddress}
        onChange={handleChange}
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium">Localidad*</label>
      <select
        name="localidad"
        className="border border-gray-300 rounded p-2 w-full"
        value={form.localidad}
        onChange={(e) => {
          const localidadSeleccionada = localidades.find((l) => l.nombre === e.target.value);
          setForm((prev) => ({
            ...prev,
            localidad: e.target.value,
            zona: localidadSeleccionada?.zona || "",
          }));
        }}
      >
        <option value="">Seleccionar localidad</option>
        {localidades.map((l) => (
          <option key={l.nombre} value={l.nombre}>
            {l.nombre}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-gray-700 font-medium">Zona</label>
      <input
        name="zona"
        className="border border-gray-300 rounded p-2 w-full bg-gray-100"
        value={form.zona}
        readOnly
      />
    </div>
  </div>

  {/* Flex */}
  <div className="mb-4 flex items-center">
    <input
      type="checkbox"
      id="flex"
      checked={form.flex || false}
      onChange={(e) => setForm((prev) => ({ ...prev, flex: e.target.checked }))}
      className="mr-2"
    />
    <label htmlFor="flex" className="text-sm text-gray-700">
      Envío Flex
    </label>
  </div>

  {/* Precio */}
  {form.zona && (
    <p className="text-sm text-gray-700 mb-4">
      Precio del envío:{" "}
      <span className="font-semibold">
        ${obtenerPrecioPorZona(form.zona).toLocaleString("es-AR")}
      </span>
    </p>
  )}

  {/* Acciones */}
  <div className="flex gap-4 mb-8">
    <button
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
      onClick={agregarEnvio}
    >
      Agregar Envío
    </button>
    <button
      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
      onClick={() =>
        setForm({
          recieverName: "",
          recieverDni: "",
          recieverPhone: "",
          recieverAddress: "",
          localidad: "",
          zona: "",
          flex: false,
        })
      }
    >
      Limpiar
    </button>
  </div>

  {/* Lista de envíos cargados */}
  {envios.length > 0 && (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Envíos cargados ({envios.length}) – Total: $
        {envios.reduce((sum, e) => sum + (e.precio || obtenerPrecioPorZona(e.zona)), 0).toLocaleString("es-AR")}
      </h3>
      <SelectorMetodoPago onMetodoSeleccionado={(metodo) => setMetodoPago(metodo)} />
      <div className="grid gap-4">
        {envios.map((e, i) => (
          <div key={i} className="justify-between border border-gray-200 rounded p-3 shadow-sm bg-gray-50 text-sm flex ">
           <div>
             <p>
              <strong>Destinatario:</strong> {e.recieverName} – <strong>Tel:</strong>{" "}
              {e.recieverPhone}
            </p>
            <p>
              <strong>Domicilio:</strong> {e.recieverAddress}, {e.localidad} ({e.zona})
            </p>
            <p>
              <strong>Precio:</strong> ${obtenerPrecioPorZona(e.zona).toLocaleString("es-AR")}
            </p>
           </div>
           
            <div className="rigth"> <button
        onClick={() =>
          setEnvios((prev) => prev.filter((_, index) => index !== i))
        }
        className="text-red-600 text-sm font-semibold hover:underline ml-4"
        title="Eliminar envío"
      >
        Eliminar
      </button></div>
          </div>
          
        ))}
      </div>
    </div>
  )}

  {/* Botones finales */}
  <div className="flex gap-4">
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
      onClick={guardarEnvios}
    >
      Crear Envíos
    </button>
    <button
      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
      onClick={() => navigate("/admin")}
    >
      Cancelar
    </button>
  </div>
  {guardando && <Spinner texto="Guardando envíos..." />}

{mensaje && (
  <div
    className={`mt-4 p-3 rounded text-sm ${
      mensaje.tipo === "ok"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {mensaje.texto}
  </div>
)}
</div>
);
}