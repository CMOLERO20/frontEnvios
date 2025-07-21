import { doc, updateDoc, increment, collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function registrarPasivoCuentaCorriente({ clienteId, clienteNombre, monto, envios = [], creadoPor = "admin" }) {
  if (!clienteId || !monto || monto <= 0 || !Array.isArray(envios) || envios.length === 0) {
    throw new Error("Datos inválidos para registrar pasivo en cuenta corriente.");
  }

  try {
    // 1. Actualizar cuenta corriente del cliente (sumar deuda)
    const clienteRef = doc(db, "usuarios", clienteId);
    await updateDoc(clienteRef, {
      cuentaCorriente: increment(monto)
    });

    // 2. Crear registro de pago negativo en la colección pagos
    const pagoRef = await addDoc(collection(db, "pagos"), {
      clienteId,
      clienteNombre,
      metodo: "cuenta_corriente",
      monto: -Math.abs(monto),
      creadoPor,
      envios,
      estado: "pendiente",
      fecha: Timestamp.now(),
    });


    for (const envioId of envios) {
      const envioRef = doc(db, "envios", envioId);
      await updateDoc(envioRef, {
        estadoPago: "pendiente",
        metodoPago: "cuenta_corriente",
        pagoId: pagoRef.id, // Asociar el pago al envío
      });
    }
    
    return pagoRef.id;
  } catch (error) {
    console.error("Error al registrar pasivo en cuenta corriente:", error);
    throw error;
  }
}