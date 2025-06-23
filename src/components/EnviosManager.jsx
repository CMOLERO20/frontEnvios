// EnviosManager.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase"; // tu config de firebase

// Estados posibles
const estados = ["Pendiente", "En curso", "Entregado", "Cancelado"];

export default function EnviosManager({ user }) {
  const enviosCollection = collection(db, "envios");

  const [envios, setEnvios] = useState([]);
  const [form, setForm] = useState({
    senderNombre: "",
    receiverNombre: "",
    receiverDireccion: "",
    receiverPhone: "",
  });

  // Cargar envíos en tiempo real ordenados por fecha creación
  useEffect(() => {
    const q = query(enviosCollection, orderBy("creadoEn", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEnvios(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Crear nuevo envío
  async function handleCrear(e) {
    e.preventDefault();

    try {
      await addDoc(enviosCollection, {
        senderId: user.uid,
        senderNombre: form.senderNombre,
        receiverNombre: form.receiverNombre,
        receiverDireccion: form.receiverDireccion,
        receiverPhone: form.receiverPhone,
        estado: "Pendiente",
        asignadoAMoto: null,
        creadoEn: serverTimestamp(),
      });

      setForm({
        senderNombre: "",
        receiverNombre: "",
        receiverDireccion: "",
        receiverPhone: "",
      });
    } catch (error) {
      alert("Error al crear el envío: " + error.message);
    }
  }

  // Eliminar envío (solo admin)
  async function handleEliminar(id) {
    if (!window.confirm("¿Eliminar envío?")) return;
    try {
      await deleteDoc(doc(db, "envios", id));
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  }

  // Cambiar estado (admin y moto)
  async function handleEstadoChange(id, nuevoEstado) {
    try {
      await updateDoc(doc(db, "envios", id), { estado: nuevoEstado });
    } catch (error) {
      alert("Error al actualizar estado: " + error.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Envíos</h1>

      <form
        onSubmit={handleCrear}
        className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block font-semibold mb-1">Remitente</label>
          <input
            type="text"
            placeholder="Nombre"
            value={form.senderNombre}
            onChange={(e) =>
              setForm({ ...form, senderNombre: e.target.value })
            }
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Destinatario</label>
          <input
            type="text"
            placeholder="Nombre"
            value={form.receiverNombre}
            onChange={(e) =>
              setForm({ ...form, receiverNombre: e.target.value })
            }
            className="border p-2 rounded w-full mb-1"
            required
          />
          <input
            type="text"
            placeholder="Dirección"
            value={form.receiverDireccion}
            onChange={(e) =>
              setForm({ ...form, receiverDireccion: e.target.value })
            }
            className="border p-2 rounded w-full mb-1"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={form.receiverPhone}
            onChange={(e) =>
              setForm({ ...form, receiverPhone: e.target.value })
            }
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Crear envío
          </button>
        </div>
      </form>

      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-2 py-1">Remitente</th>
            <th className="border border-gray-300 px-2 py-1">Destinatario</th>
            <th className="border border-gray-300 px-2 py-1">
              Dirección destino
            </th>
            <th className="border border-gray-300 px-2 py-1">
              Teléfono destinatario
            </th>
            <th className="border border-gray-300 px-2 py-1">Estado</th>
            {(user.role === "admin" || user.role === "moto") && (
              <th className="border border-gray-300 px-2 py-1">Actualizar</th>
            )}
            {user.role === "admin" && (
              <th className="border border-gray-300 px-2 py-1">Eliminar</th>
            )}
          </tr>
        </thead>
        <tbody>
          {envios.length === 0 && (
            <tr>
              <td
                colSpan={user.role === "admin" ? 7 : 6}
                className="p-2 text-center text-gray-500"
              >
                No hay envíos cargados.
              </td>
            </tr>
          )}
          {envios.map(
            ({
              id,
              senderNombre,
              receiverNombre,
              receiverDireccion,
              receiverPhone,
              estado,
            }) => (
              <tr key={id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-2 py-1">
                  {senderNombre}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {receiverNombre}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {receiverDireccion}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {receiverPhone}
                </td>
                <td className="border border-gray-300 px-2 py-1">{estado}</td>
                {(user.role === "admin" || user.role === "moto") && (
                  <td className="border border-gray-300 px-2 py-1">
                    <select
                      value={estado}
                      onChange={(e) =>
                        handleEstadoChange(id, e.target.value)
                      }
                      className="border rounded px-1 py-0.5"
                    >
                      {estados.map((est) => (
                        <option key={est} value={est}>
                          {est}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                {user.role === "admin" && (
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <button
                      onClick={() => handleEliminar(id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 rounded"
                      title="Eliminar envío"
                    >
                      X
                    </button>
                  </td>
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}