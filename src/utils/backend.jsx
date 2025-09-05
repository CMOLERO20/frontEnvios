export async function obtenerEnvios() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/envios`);
    if (!res.ok) throw new Error("Error al obtener los envíos");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al cargar envíos:", error);
    return [];
  }
}