import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "../firebase";
import obtenerPrecioPorZona from "../utils/obtenerPrecioPorZona";
import { registrarPago } from "../utils/registrarPago";

export async function crearEnvios({ enviosOCR, remitenteId, senderName, metodoPago }) {
console.log("🚀 ~ crearEnvios ~ enviosOCR, remitenteId, senderName, metodoPago:", enviosOCR, remitenteId, senderName, metodoPago)
const totalPrecio = enviosOCR.reduce((acc, envio) => acc + (envio.precio || 0), 0);
  const idsEnvios = [];

  for (const envio of enviosOCR) {
    let fotoUrl = "";

    // Subir imagen si existe
    if (envio.archivoOriginal) {
      const nombreArchivo = `etiquetas/${uuidv4()}.jpg`;
      const storageRef = ref(storage, nombreArchivo);
      const snapshot = await uploadBytes(storageRef, envio.archivoOriginal);
      fotoUrl = await getDownloadURL(snapshot.ref);
    }

    const precio = obtenerPrecioPorZona(envio.zona);
    const envioData = { ...envio };
    delete envioData.archivoOriginal;

    const docRef = await addDoc(collection(db, "envios"), {
      ...envioData,
      senderId: remitenteId,
      senderName: senderName || "",
      precio,
      demorado: false,
      activo: true,
      creado: Timestamp.now(),
      estado: "Pendiente",
      motoId: null,
      motoName: "",
      numeroEnvio: "ENV-" + uuidv4().slice(0, 8),
      fotoUrl,
    });
console.log("Envío guardado con ID:", docRef.id);
    idsEnvios.push(docRef.id);

    await addDoc(collection(docRef, "historial"), {
      estado: "Pendiente",
      fecha: Timestamp.now(),
    });
  }

   try {
        await registrarPago({
       clienteId: remitenteId,
  clienteNombre: senderName,
  metodo: metodoPago,
  monto: totalPrecio,
  creadoPor: "cliente",
  envios: idsEnvios })
   } catch (error) {
    console.error("Error al registrar el pago:", error);
    throw new Error("Error al registrar el pago.");
    
   }
    
 

  return idsEnvios;
}
