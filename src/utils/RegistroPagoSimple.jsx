import { collection, addDoc,  Timestamp } from "firebase/firestore";
import { db } from "../firebase"; // Ajustá el path si es necesario

export async function registrarPago({
  clienteId,
  clienteNombre,
  metodo, // "transferencia" | "cuenta_corriente" | "efectivo"
  monto,
  creadoPor = "cliente",
  cantidadEnvios
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
    estado: metodo === "efectivo" ? "confirmado" : "pendiente",
    creado: Timestamp.now(),
    cantidadEnvios,
  };

  try {
    // 1. Registrar el pago
    const docRef = await addDoc(collection(db, "pagos"), pago);


    return docRef.id;
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    throw error;
  }
}