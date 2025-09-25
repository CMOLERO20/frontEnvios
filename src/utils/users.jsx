// src/utils/users.js
import {
  collection, onSnapshot, addDoc, updateDoc, doc, getDocs,
  serverTimestamp, where, query, writeBatch
} from "firebase/firestore";
import { db } from "../firebase";

export const toEmailLower = (email = "") => email.trim().toLowerCase();
export const normalizePhone = (phone = "") => phone.replace(/[^\d\s()+-]/g, "");

// ✅ Suscripción sin orderBy: no requiere que todos tengan `creado`
export function subscribeUsers(onData, onError) {
  const ref = collection(db, "usuarios");
  return onSnapshot(
    ref,
    (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Ordenar en memoria: primero los que tienen `creado`, más nuevos arriba
      arr.sort(
        (a, b) =>
          (b.creado?.toMillis?.() || 0) - (a.creado?.toMillis?.() || 0)
      );
      onData?.(arr);
    },
    (err) => onError?.(err)
  );
}

// Detección de email duplicado (case-insensitive)
export async function isEmailTaken(emailLower, excludeId) {
  const q = query(collection(db, "usuarios"), where("emailLower", "==", emailLower));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  if (!excludeId) return true;
  return snap.docs.some((d) => d.id !== excludeId);
}

// Crear usuario
export async function createUser({ nombre, email, telefono, role = "client", activo = true }) {
  const payload = {
    nombre: (nombre || "").trim(),
    email: (email || "").trim(),
    emailLower: toEmailLower(email || ""),
    telefono: normalizePhone(telefono || ""),
    role,
    activo: !!activo,
    creado: serverTimestamp(), // se setea en nuevos
  };
  const docRef = await addDoc(collection(db, "usuarios"), payload);
  await updateDoc(doc(db, "usuarios", docRef.id), { uid: docRef.id });
  return docRef.id;
}

// Actualizar usuario
export async function updateUserById(id, updates) {
  const safe = { ...updates };
  if (safe.email) safe.emailLower = toEmailLower(safe.email);
  if (safe.telefono) safe.telefono = normalizePhone(safe.telefono);
  safe.actualizado = serverTimestamp();
  await updateDoc(doc(db, "usuarios", id), safe);
}

// Activar / desactivar
export async function setUserActive(id, activo) {
  await updateDoc(doc(db, "usuarios", id), {
    activo: !!activo,
    actualizado: serverTimestamp(),
  });
}

/* ---------- OPCIONAL: Backfill de campos faltantes ---------- */
// Rellena en lote campos ausentes en usuarios antiguos.
export async function backfillUsersMissingFields({
  defaultRole = "client",
  defaultActivo = true,
} = {}) {
  const snap = await getDocs(collection(db, "usuarios"));
  const batch = writeBatch(db);
  let count = 0;

  snap.forEach((d) => {
    const data = d.data() || {};
    const patch = {};

    if (!data.uid) patch.uid = d.id;
    if (!data.creado) patch.creado = serverTimestamp();
    if (data.email && !data.emailLower) patch.emailLower = toEmailLower(data.email);
    if (typeof data.activo === "undefined") patch.activo = defaultActivo;
    if (!data.role) patch.role = defaultRole;

    if (Object.keys(patch).length) {
      batch.update(doc(db, "usuarios", d.id), patch);
      count++;
    }
  });

  if (count > 0) await batch.commit();
  return count; // cantidad de docs actualizados
}
