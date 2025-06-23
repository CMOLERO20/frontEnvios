import { doc, updateDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default async function registrarCambioEstado(envioId, nuevoEstado, extraFields = {}) {
  const user = auth.currentUser;
  const email = user?.email || "Desconocido";
    
const { motivo , recibidoPor, ...camposExtraPrincipales  } = extraFields;
  const envioRef = doc(db, "envios", envioId);

  // 1. Actualizar estado actual y cualquier extra field
  await updateDoc(envioRef, {
    estado: nuevoEstado,
      ...camposExtraPrincipales,
  });

  // 2. Agregar entrada en subcolección de historial
  await addDoc(collection(envioRef, "historial"), {
    estado: nuevoEstado,
    fecha: Timestamp.now(),
    usuario: email,
     ...(motivo && { motivo }),
     ...(recibidoPor && { recibidoPor }),
  });
}