import { collection, query, where, getDocs } from "firebase/firestore";
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