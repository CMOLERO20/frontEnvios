import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Registra un evento en el historial del envío
 * @param {string} envioId - ID del envío
 * @param {string} descripcion - Descripción del cambio (ej: "Se modificó el domicilio")
 * @param {string} autor - (Opcional) Nombre del usuario que realiza la acción
 */
export default async function registrarHistorialEnvio(envioId, descripcion, autor = 'sistema') {
  if (!envioId || !descripcion) return;

  const ref = collection(db, 'envios', envioId, 'historial');
  await addDoc(ref, {
    descripcion,
    autor,
    timestamp: serverTimestamp(),
  });
}
