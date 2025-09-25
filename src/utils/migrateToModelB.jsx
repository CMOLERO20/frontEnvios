import {
  getDocs, collection, writeBatch, doc, serverTimestamp, getDoc, setDoc, updateDoc
} from "firebase/firestore";
import { db } from "../firebase";

// Construye un mapa emailLower -> user doc
const toEmailLower = (e="") => e.trim().toLowerCase();

export async function backfillUsuariosToClientes() {
  const usersSnap = await getDocs(collection(db, "usuarios"));
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 1) Crear clientes desde usuarios con role: "client"
  let batch = writeBatch(db);
  let count = 0, writes = 0;

  for (const u of users) {
    const role = String(u.role || "").toLowerCase();
    if (role !== "client") continue;

    const clienteId = u.clienteId || u.id; // podés usar uid como clienteId
    const cRef = doc(db, "clientes", clienteId);

    const cSnap = await getDoc(cRef);
    if (!cSnap.exists()) {
      batch.set(cRef, {
        id: clienteId,
        nombre: u.nombre || u.email || `Cliente ${clienteId}`,
        email: u.email || "",
        telefono: u.telefono || "",
        activo: typeof u.activo === "boolean" ? u.activo : true,
        creado: u.creado || serverTimestamp(),
      }, { merge: true });
      writes++;
    }

    const uRef = doc(db, "usuarios", u.id);
    batch.update(uRef, { clienteId });
    writes++;
    count++;

    if (writes >= 450) {
      await batch.commit();
      batch = writeBatch(db);
      writes = 0;
    }
  }

  if (writes > 0) await batch.commit();
  return count; // usuarios client actualizados
}
async function buildUserMaps() {
  const usersSnap = await getDocs(collection(db, "usuarios"));
  const byUid = new Map();
  const byEmail = new Map();
  usersSnap.forEach(d => {
    const u = d.data() || {};
    byUid.set(d.id, u.clienteId || d.id);
    if (u.email) byEmail.set(toEmailLower(u.email), u.clienteId || d.id);
  });
  return { byUid, byEmail };
}

async function backfillCollectionClienteId(colName, inferKeys = []) {
  const snap = await getDocs(collection(db, colName));
  const { byUid, byEmail } = await buildUserMaps();
  let batch = writeBatch(db);
  let writes = 0, count = 0;

  for (const d of snap.docs) {
    const data = d.data() || {};
    if (data.clienteId) continue;

    let cid = null;

    // 1) por uid sender
    for (const k of inferKeys) {
      const maybeUid = data[k];
      if (maybeUid && byUid.has(maybeUid)) { cid = byUid.get(maybeUid); break; }
    }

    // 2) por email
    if (!cid && data.clienteEmail && byEmail.has(toEmailLower(data.clienteEmail))) {
      cid = byEmail.get(toEmailLower(data.clienteEmail));
    }

    if (cid) {
      batch.update(doc(db, colName, d.id), { clienteId: cid });
      writes++; count++;
      if (writes >= 450) { await batch.commit(); batch = writeBatch(db); writes = 0; }
    }
  }
  if (writes > 0) await batch.commit();
  return count;
}

// Público para usar desde un botón admin:
export async function backfillClienteIdAll() {
  const env = await backfillCollectionClienteId("envios", ["senderId","remitenteId","clienteIdLegacy"]);
  const reg = await backfillCollectionClienteId("registros_diarios", ["clienteId","remitenteId","senderId"]);
  const pag = await backfillCollectionClienteId("pagos", ["clienteId","senderId","remitenteId"]);
  return { env, reg, pag };
}
