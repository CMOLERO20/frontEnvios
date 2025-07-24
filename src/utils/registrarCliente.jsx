// src/utils/registrarCliente.js
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function registrarCliente({ nombre, telefono, email }) {
  if (!nombre || !telefono || !email) {
    throw new Error("Faltan datos obligatorios");
  }

  try {
    // Crear en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, "123456");
    const { uid } = userCredential.user;

    // Guardar en Firestore
    await setDoc(doc(db, "usuarios", uid), {
      nombre,
      telefono,
      email,
      role: "client",
      creado: serverTimestamp(),
      uid: uid,
    });

    return { uid, email };
  } catch (error) {
    throw new Error(error.message);
  }
}
