import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function registrarPago({
  clienteId,
  clienteNombre,
  metodo, // "transferencia" | "cuenta_corriente" | "efectivo"
  monto,
  creadoPor = "cliente", // o "admin"
  envios = []
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
    const docRef = await addDoc(collection(db, "pagos"), pago);
    return docRef.id;
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    throw error;
  }
}
