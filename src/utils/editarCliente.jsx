// utils/editarCliente.js
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Edita los datos de un cliente en Firestore
 * @param {string} clienteId - ID del documento del cliente
 * @param {object} datos - Campos a actualizar (nombre, email, telefono, etc.)
 
 */
export async function editarCliente(clienteId, datos) {
  try {
    if (!clienteId) {
      throw new Error("El ID del cliente es obligatorio.");
    }

    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      throw new Error("Los datos a actualizar deben ser un objeto válido.");
    }

    const ref = doc(db, "usuarios", clienteId);
    await updateDoc(ref, datos);

  
  } catch (error) {
    console.error("Error al editar cliente:", error.message);
  
  }
}