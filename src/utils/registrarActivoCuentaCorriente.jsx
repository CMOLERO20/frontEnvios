import { doc, updateDoc, increment, collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function registrarActivoCuentaCorriente({
  clienteId,
  clienteNombre,
  monto,
  envios = [],
  metodo,
  creadoPor = "admin"
}) {
  if (!clienteId || !monto || monto <= 0) {
    throw new Error("Datos inválidos para registrar activo en cuenta corriente.");
  }

  try {
    // 1. Actualizar cuenta corriente del cliente (restar deuda)
    const clienteRef = doc(db, "usuarios", clienteId);
    await updateDoc(clienteRef, {
      cuentaCorriente: increment(-monto)
    });

    // 2. Crear registro de pago positivo en la colección pagos
    const pagoRef = await addDoc(collection(db, "pagos"), {
      clienteId,
      clienteNombre,
      metodo: "cuenta_corriente",
      monto: Math.abs(monto),
      creadoPor,
      envios,
      estado: "confirmado",
      fecha: Timestamp.now(),
    });

    // 3. Actualizar estado de pago de los envíos (opcional)
    for (const envioId of envios) {
      const envioRef = doc(db, "envios", envioId);
      await updateDoc(envioRef, {
        estadoPago: "confirmado",
        metodoPago: "cuenta_corriente",
      });
    }

    return pagoRef.id;
  } catch (error) {
    console.error("Error al registrar activo en cuenta corriente:", error);
    throw error;
  }
}