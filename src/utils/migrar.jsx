import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase"; // ajustá el path según tu proyecto

export async function migrarUsuariosAClientes() {
  const usuariosSnap = await getDocs(collection(db, "usuarios"));

  let migrados = 0;

  for (const docu of usuariosSnap.docs) {
    const usuario = docu.data();
    const id = docu.id;

    if (usuario.role === "client") {
      const clienteRef = doc(db, "clientes", id);
      const clienteSnap = await getDoc(clienteRef);

      // Solo crear si no existe
      if (!clienteSnap.exists()) {
        await setDoc(clienteRef, {
          creado: serverTimestamp(),
          nombre: usuario.nombre || "",
          email: usuario.email || "",
          telefono: usuario.telefono || "",
          tokenML: "",
          refreshTokenML: "",
          idML: "",
          ultimaRenovacionML: null,
          activo: true,
        });
        migrados++;
      }

      // Actualizar usuario con su clienteId
      const usuarioRef = doc(db, "usuarios", id);
      await updateDoc(usuarioRef, { clienteId: id });
    }
  }

  return migrados;
}
