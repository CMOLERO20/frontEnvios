import {
  collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, query, where,
  serverTimestamp, writeBatch, limit, startAfter, orderBy
} from "firebase/firestore";
import { db } from "../firebase";

export async function createCliente({ nombre, email, telefono, activo = true }) {
  const payload = {
    nombre: (nombre || "").trim(),
    email: (email || "").trim(),
    telefono: (telefono || "").trim(),
    activo: !!activo,
    creado: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "clientes"), payload);
  await updateDoc(doc(db, "clientes", ref.id), { id: ref.id }); // comodidad
  return ref.id;
}

export async function setClienteById(id, data) {
  await setDoc(doc(db, "clientes", id), { ...data, id }, { merge: true });
}

export async function updateClienteById(id, updates) {
  await updateDoc(doc(db, "clientes", id), { ...updates, actualizado: serverTimestamp() });
}

export async function getClient(id) {
  const snap = await getDoc(doc(db, "clientes", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getClients({ activos = true } = {}) {
  const col = collection(db, "clientes");
  const q = activos ? query(col, where("activo", "==", true)) : col;
  const snap = await getDocs(q);
  const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  // orden simple por nombre
  return arr.sort((a,b)=>(a?.nombre||"").localeCompare(b?.nombre||""));
}
