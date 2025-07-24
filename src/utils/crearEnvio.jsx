import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "../firebase";
import obtenerPrecioPorZona from "../utils/obtenerPrecioPorZona";
import { registrarPago } from "../utils/registrarPago";
import { registrarPasivoCuentaCorriente } from "../utils/registrarPasivoCuentaCorriente";
import { comprimirImagen } from "../utils/comprimirImagen";

export async function crearEnvios({ enviosOCR, remitenteId, senderName, metodoPago }) {
console.log("🚀 ~ crearEnvios ~ enviosOCR, remitenteId, senderName, metodoPago:", enviosOCR, remitenteId, senderName, metodoPago)
const totalPrecio = enviosOCR.reduce((acc, envio) => acc + (envio.precio || 0), 0);
  const idsEnvios = [];

  for (const envio of enviosOCR) {
    let fotoUrl = "";
    const archivo = envio.archivoOriginal || envio.imagenBlob || null;
    const envioData = { ...envio };
    // Subir imagen si existe
    if (archivo) {
      const archivoComprimido = await comprimirImagen(archivo);
      const nombreArchivo = `etiquetas/${uuidv4()}.jpg`;
      const storageRef = ref(storage, nombreArchivo);
      const snapshot = await uploadBytes(storageRef, archivoComprimido);
      fotoUrl = await getDownloadURL(snapshot.ref);
       delete envioData.archivoOriginal;
    delete envioData.imagenBlob;
    }

    const precio = obtenerPrecioPorZona(envio.zona);
    
   

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
      fotoUrl: fotoUrl || "",
      rendido: false,
    });
console.log("Envío guardado con ID:", docRef.id);
    idsEnvios.push(docRef.id);

    await addDoc(collection(docRef, "historial"), {
      estado: "Pendiente",
      creado: Timestamp.now(),
    });
  }

   try {
    // Registrar el pago si es necesario
    if (metodoPago === "cuenta_corriente" && totalPrecio > 0) {
      await registrarPasivoCuentaCorriente({
       clienteId: remitenteId,
      clienteNombre: senderName,
      metodo: metodoPago,
      monto: totalPrecio,
      creadoPor: "admin",
      envios: idsEnvios }) } else {
      if (totalPrecio > 0) {
        await registrarPago({
       clienteId: remitenteId,
      clienteNombre: senderName,
      metodo: metodoPago,
      monto: totalPrecio,
      creadoPor: "admin",
      envios: idsEnvios })}
        }
      } catch (error) {
        console.error("Error al registrar el pago:", error);
        throw new Error("Error al registrar el pago.");
        
      }
    
    
 

  return idsEnvios;
}