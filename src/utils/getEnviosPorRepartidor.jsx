import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export const getEnviosPorRepartidor = (repartidorId, callback) => {
  const q = query(collection(db, "envios"), where("motoId", "==", repartidorId));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};