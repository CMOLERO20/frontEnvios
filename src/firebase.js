import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {  getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
  } from "firebase/firestore";
  


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const db = getFirestore(app);
export const auth = getAuth(app);

const enviosCollection = collection(db, "envios");

export async function crearEnvio({ clienteId, clienteNombre, direccion }) {
    return await addDoc(enviosCollection, {
      clienteId,
      clienteNombre,
      direccion,
      estado: "Pendiente",
      asignadoAMoto: null,
      creadoEn: serverTimestamp(),
    });
  }
  
  // Leer envíos (según filtros)
  export async function obtenerEnvios(uid, role) {
    let q;
    if (role === "admin") {
      q = query(enviosCollection);
    } else if (role === "user") {
      q = query(enviosCollection, where("clienteId", "==", uid));
    } else if (role === "moto") {
      q = query(enviosCollection, where("asignadoAMoto", "==", uid));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  // Actualizar estado o asignación
  export async function actualizarEnvio(id, data) {
    const docRef = doc(db, "envios", id);
    return await updateDoc(docRef, data);
  }
  
  // Eliminar envío
  export async function eliminarEnvio(id) {
    const docRef = doc(db, "envios", id);
    return await deleteDoc(docRef);
  }

  