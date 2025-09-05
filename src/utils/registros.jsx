import { collection, addDoc,onSnapshot, serverTimestamp, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { doc, getDoc, writeBatch } from "firebase/firestore";
// Normaliza fecha a 00:00 (para filtros por día)
export function startOfDayTS(date = new Date()) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return Timestamp.fromDate(d);
}


export async function crearRegistroDiario({
  fecha = new Date(),
  clienteId,
  clienteNombre,
  cantidades = { CABA:0, Z1:0, Z2:0, Z3:0 },
  montoTotal = 0,
  metodoPago,
  notas = "",
  creadoPorUid,
  creadoPorNombre
}) {
  if (!clienteId || !clienteNombre) throw new Error("Falta cliente");
  const ref = await addDoc(collection(db, "registros_diarios"), {
    fecha: startOfDayTS(fecha),
    clienteId,
    clienteNombre,
    cantidades,
    montoTotal: Number(montoTotal || 0),
    metodoPago,
    notas,
    creadoPorUid: creadoPorUid || null,
    creadoPorNombre: creadoPorNombre || null,
    creadoEn: serverTimestamp()
  });
  return ref.id;
}

export async function getRegistrosPorDia(fecha = new Date(), clienteId) {
  const clauses = [where("fecha", "==", startOfDayTS(fecha))];
  if (clienteId) clauses.push(where("clienteId", "==", clienteId));
  const q = query(collection(db, "registros_diarios"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

 
 
export function subscribeRegistrosPorDia(fecha = new Date(), clienteId, onData, onError) {
  const q = query(
    collection(db, "registros_diarios"),
    where("fecha", "==", startOfDayTS(fecha))
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      let arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // filtro opcional por cliente en memoria (evita índice compuesto)
      if (clienteId) arr = arr.filter((r) => r.clienteId === clienteId);

      // orden descendente por creadoEn en memoria
      arr.sort(
        (a, b) => (b.creadoEn?.toMillis?.() || 0) - (a.creadoEn?.toMillis?.() || 0)
      );

      onData(arr);
    },
    (err) => {
      console.error("subscribeRegistrosPorDia error:", err);
      onError?.(err);
    }
  );

  return unsub;
}

export async function eliminarRegistroYPagoById(registroId) {
  if (!registroId) throw new Error("Falta registroId");
  const regRef = doc(db, "registros_diarios", registroId);
  const snap = await getDoc(regRef);
  if (!snap.exists()) throw new Error("El registro no existe");

  const { pagoId } = snap.data() || {};
  const batch = writeBatch(db);

  // borrar registro
  batch.delete(regRef);

  // borrar pago si existe
  if (pagoId) {
    const pagoRef = doc(db, "pagos", pagoId);
    batch.delete(pagoRef);
  }

  await batch.commit();
  return { registroId, pagoId: pagoId || null };
}