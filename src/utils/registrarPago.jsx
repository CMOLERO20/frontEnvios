import { collection, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../firebase"; // Ajustá el path si es necesario

export async function registrarPago({
  clienteId,
  clienteNombre,
  metodo, // "transferencia" | "cuenta_corriente" | "efectivo"
  monto,
  creadoPor = "cliente",
  envios = [] // array de IDs de los envíos
}) {
  if (!clienteId || !metodo || !monto) {
    throw new Error("Faltan datos obligatorios para registrar el pago.");
  }

  const pago = {
    clienteId,
    clienteNombre,
    metodo,
    monto,
    creadoPor,
    envios,
    estado: metodo === "efectivo" ? "confirmado" : "pendiente",
    fecha: Timestamp.now(),
  };

  try {
    // 1. Registrar el pago
    const docRef = await addDoc(collection(db, "pagos"), pago);

    // 2. Asociar el pago a los envíos
    await Promise.all(
      envios.map(async (envioId) => {
        console.log("🚀 ~ envios.map ~ envioId:", envioId)
        const envioRef = doc(db, "envios", envioId);
        await updateDoc(envioRef, {
          pagoId: docRef.id,
          estadoPago: pago.estado, // opcional: puede ser "pendiente" o "confirmado"
        });
      })
    );

    return docRef.id;
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    throw error;
  }
}