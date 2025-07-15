import { collection, query, where, getDocs , getDoc, doc} from "firebase/firestore";
import { db } from "../firebase"; // ajustá la ruta si es diferente

export const getClients = async () => {
  try {
    const q = query(collection(db, "usuarios"), where("role", "==", "client"));
    const snapshot = await getDocs(q);
    const clientes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  
    return clientes;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

export async function getClient(id) {
  if (!id) throw new Error("Se requiere un ID de cliente");

  try {
    const docRef = doc(db, "usuarios", id); 
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Cliente no encontrado");
    }

    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    throw error;
  }
}