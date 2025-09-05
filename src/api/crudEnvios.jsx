const BASE_URL = import.meta.env.VITE_API_URL + "/api/envios";

// GET todos los envíos
export async function obtenerEnvios() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al obtener envíos");
  return await res.json();
}

// GET un envío por ID
export async function obtenerEnvioPorId(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener el envío");
  return await res.json();
}

// POST nuevo envío
export async function crearEnvio(envioData) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envioData),
  });
  if (!res.ok) throw new Error("Error al crear el envío");
  return await res.json();
}

// PUT actualizar un envío
export async function actualizarEnvio(id, datosActualizados) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosActualizados),
  });
  if (!res.ok) throw new Error("Error al actualizar el envío");
  return await res.json();
}

// DELETE eliminar un envío
export async function eliminarEnvio(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el envío");
  return true;
}

// PATCH cambiar estado del envío
export async function cambiarEstadoEnvio(id, nuevoEstado, realizadoPor = "sistema") {
  const res = await fetch(`${BASE_URL}/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado, actualizadoPor: realizadoPor }),
  });
  if (!res.ok) throw new Error("Error al cambiar el estado");
  return await res.json();
}

// GET historial de un envío
export async function obtenerHistorialEnvio(id) {
  const res = await fetch(`${BASE_URL}/${id}/historial`);
  if (!res.ok) throw new Error("Error al obtener historial");
  return await res.json();
}