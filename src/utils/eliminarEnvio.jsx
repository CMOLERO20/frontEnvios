import { doc, deleteDoc, getDoc, addDoc, collection, updateDoc, increment} from 'firebase/firestore';
import { db } from '../firebase';
import registrarHistorialEnvio from './registrarHistorialEnvio';
import { getPagoById } from './getPagos';
import { registrarActivoCuentaCorriente } from './registrarActivoCuentaCorriente';

export async function eliminarEnvio(envioId) {
  const envioRef = doc(db, 'envios', envioId);
  const envioSnap = await getDoc(envioRef);
  if (!envioSnap.exists()) throw new Error('Envío no encontrado');

  const envio = envioSnap.data();
 

  await deleteDoc(envioRef);
console.log("🚀 ~ eliminarEnvio ~ envio:", envio)

    if(envio.pagoId && envio.metodoPago === "cuenta_corriente") {
   const clienteRef = doc(db, "usuarios", envio.senderId);
       await updateDoc(clienteRef, {
         cuentaCorriente: increment(-envio.precio)
       });
   
     
  } 

 
    try {
  await addDoc(collection(db, 'pagos'), {
    clienteId: envio.senderId || "desconocido",
    clienteNombre: envio.senderName || "desconocido",
    monto: -1 * (envio.precio || 0),
    metodo: envio.metodoPago || "desconocido",
    creadoPor: 'sistema',
    envioId: envioId,
    motivo: 'Devolución por eliminación',
    estado: "confirmado",
    fecha: new Date(),
  });
} catch (error) {
  console.error("Error al registrar pago por eliminación de envío:", error);
}
 
  

}
