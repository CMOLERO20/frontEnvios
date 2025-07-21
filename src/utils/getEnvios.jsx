import { query, collection, getDocs, where, deleteDoc,doc,updateDoc , getDoc} from "firebase/firestore";
import { db } from "../firebase"; // ajustá la ruta si es diferente

export const getEnvios = async () => {
  try {
 const snapshot = await getDocs(collection(db, "envios"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
  
    return data;
  } catch (error) {
    console.error("Error al obtener envios:", error);
    return [];
  }
};

export const getEnviosById = async (id) => {
  try {
 const enviosRef = collection(db, "envios");
const enviosQuery = query(enviosRef, where("senderId", "==", id));
const snapshot = await getDocs(enviosQuery);
const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data;
  } catch (error) {
    console.error("Error al obtener envios:", error);
    return [];
  }
};

/**
 * Modificar un envío
 */
export async function modificarEnvio(id, datosActualizados) {
  try {
    const docRef = doc(db, "envios", id);
    await updateDoc(docRef, datosActualizados);
  } catch (error) {
    console.error("Error al modificar envío:", error);
    throw error;
  }
}

/**
 * Eliminar un envío
 */
export async function eliminarEnvio(id) {
  try {
    const docRef = doc(db, "envios", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar envío:", error);
    throw error;
  }
}
/**
 * Obtener un envío por ID
 */
export async function obtenerEnvio(id) {
  try {
    const docRef = doc(db, "envios", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("El envío no existe");
    }
  } catch (error) {
    console.error("Error al obtener envío:", error);
    throw error;
  }
}