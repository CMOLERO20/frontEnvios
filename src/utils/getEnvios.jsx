import { collection, getDocs, where} from "firebase/firestore";
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
 const snapshot = await getDocs(collection(db, "envios"), where("senderId", "==", id));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
  
    return data;
  } catch (error) {
    console.error("Error al obtener envios:", error);
    return [];
  }
};