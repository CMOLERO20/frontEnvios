// src/utils/registrarCliente.js
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp , addDoc, collection , updateDoc} from "firebase/firestore";

export async function registrarCliente({ nombre, telefono, email }) {
  if (!nombre || !telefono || !email) {
    throw new Error("Faltan datos obligatorios");
  }

  try {
    // Crear en Firebase Auth
//    const userCredential = await createUserWithEmailAndPassword(auth, email, "123456");
  //  const { uid } = userCredential.user;

    // Guardar en Firestore
   const docRef =  await addDoc(collection(db, "usuarios"), {
      nombre,
      telefono,
      email,
      role: "client",
      creado: serverTimestamp(),
      
    });

  await updateDoc(docRef, { uid: docRef.id });

    return { id: docRef.id, uid: docRef.id, email };
  } catch (error) {
    throw new Error(error.message);
  }
}
