import { doc, updateDoc, getDoc, addDoc, collection, increment } from 'firebase/firestore';
import { db } from '../firebase';
import registrarCambioEstado from './registrarCambioEstado';

export async function cancelarEnvio(envioId) {
  const envioRef = doc(db, 'envios', envioId);
  const envioSnap = await getDoc(envioRef);
  if (!envioSnap.exists()) throw new Error('Envío no encontrado');

  const envio = envioSnap.data();
  console.log("🚀 ~ cancelarEnvio ~ envio:", envio)
 

  await updateDoc(envioRef, { estado: 'Cancelado' });
  await registrarCambioEstado(envioId, 'Cancelado');

  if (envio.pagoId ) {
     try {
  await addDoc(collection(db, 'pagos'), {
    clienteId: envio.senderId || "desconocido",
    clienteNombre: envio.senderName || "desconocido",
    monto: -1 * (envio.precio || 0),
    metodo: envio.metodoPago || "desconocido",
    creadoPor: 'sistema',
    envioId: envioId,
    motivo: 'Cancelación de envío',
    estado: "confirmado",
    fecha: new Date(),
  });
} catch (error) {
  console.error("Error al registrar pago por eliminación de envío:", error);
}
  }
    if(envio.pagoId && envio.metodoPago === "cuenta_corriente") {
     const clienteRef = doc(db, "usuarios", envio.senderId);
            await updateDoc(clienteRef, {
              cuentaCorriente: increment(-envio.precio)
            });
    }
}
