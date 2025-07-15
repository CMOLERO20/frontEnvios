import { collection, getDocs, where} from "firebase/firestore";
import { db } from "../firebase"; // ajustá la ruta si es diferente

export const getPagos = async () => {
  try {
 const snapshot = await getDocs(collection(db, "pagos"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
  
    return data;
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return [];
  }
};

export const getPagosByClient = async (id) => {
  try {
 const snapshot = await getDocs(collection(db, "pagos"), where("clienteId", "==", id));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
  
    return data;
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return [];
  }
};