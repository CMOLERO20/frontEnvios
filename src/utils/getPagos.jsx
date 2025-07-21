import { query, collection, getDocs, where , doc , getDoc} from "firebase/firestore";
import { db } from "../firebase"; // ajustá la ruta si es diferente

const getPagos = async () => {
  try {
 const snapshot = await getDocs(collection(db, "pagos"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
  
    return data;
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return [];
  }
};

const getPagosByClient = async (id) => {
  console.log("🚀 ~ getPagosByClient ~ id:", id)
  try {
    const pagosRef = collection(db, "pagos");
const pagosQuery = query(pagosRef, where("clienteId", "==", id));
const snapshot = await getDocs(pagosQuery);
const pagos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
 
  
    return pagos;
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return [];
  }
};

 const getPagoById = async (pagoId) => {
  if (!pagoId) return null;

  try {
    const docRef = doc(db, "pagos", pagoId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn("No se encontró el pago con ID:", pagoId);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el pago:", error);
    return null;
  }
};

export  {getPagos, getPagosByClient, getPagoById}