// src/utils/envios.js
import { addDoc, collection, Timestamp, onSnapshot, where, query, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export const PRECIOS = { CABA: 3800, Z1: 6000, Z2: 7900, Z3: 8900 };
export function getPrecioPorZona(zona) { return PRECIOS[zona] || 0; }

/** Crea envío manual con tu estructura (NO crea pago) */
export async function crearEnvioManualCompat(input) {
  const {
    remitenteId, senderName = "", destinatario, precio = 0, notas = "",
    fotoUrl = "", creadoPorUid = null, creadoPorRole = null,
  } = input || {};
  if (!remitenteId || !senderName) throw new Error("Faltan datos del remitente.");
  if (!destinatario?.nombre || !destinatario?.direccion || !destinatario?.localidad || !destinatario?.zona) {
    throw new Error("Faltan datos del destinatario.");
  }

  const numeroEnvio = "ENV-" + uuidv4().slice(0, 8).toUpperCase();

  const envioData = {
    senderId: remitenteId,
    senderName: senderName || "",
    recieverName: destinatario.nombre,
    recieverPhone: destinatario.telefono || "",
    recieverAddress: destinatario.direccion,
    localidad: destinatario.localidad,
    zona: destinatario.zona,
    precio: Number(precio || 0),
    demorado: false,
    activo: true,
    creado: Timestamp.now(),
    estado: "Pendiente",
    motoId: null,
    motoName: "",
    numeroEnvio,
    fotoUrl,
    rendido: false,
    notas: notas || "",
    origen: "manual",
    creadoPorUid: creadoPorUid || null,
    creadoPorRole: creadoPorRole || null,
  };

  const docRef = await addDoc(collection(db, "envios"), envioData);
  await addDoc(collection(docRef, "historial"), { estado: "Pendiente", creado: Timestamp.now() });
  return { id: docRef.id, numeroEnvio };
}

/** Suscripción en tiempo real a envíos del remitente */
export function listenEnviosBySender(senderId, onData, onError) {
  if (!senderId) return () => {};
  const q = query(collection(db, "envios"), where("senderId", "==", senderId));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => (b.creado?.toMillis?.() || 0) - (a.creado?.toMillis?.() || 0));
      onData?.(arr);
    },
    (err) => onError?.(err)
  );
  return unsub;
}

/** Historial (subcolección) ordenado ascendente por fecha */
export async function getHistorialEnvio(envioId) {
  const snap = await getDocs(collection(db, "envios", envioId, "historial"));
  const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  arr.sort((a, b) => (a.creado?.toMillis?.() || 0) - (b.creado?.toMillis?.() || 0));
  return arr;
}
