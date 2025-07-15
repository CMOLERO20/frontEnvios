import imageCompression from "browser-image-compression";


export async function comprimirImagen(imagenOriginal, opcionesPersonalizadas = {}) {
  const opcionesPorDefecto = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1000,
    useWebWorker: true,
  };

  const opciones = { ...opcionesPorDefecto, ...opcionesPersonalizadas };

  try {
    const imagenComprimida = await imageCompression(imagenOriginal, opciones);
    return imagenComprimida;
  } catch (error) {
    console.error("Error al comprimir la imagen:", error);
    throw error;
  }
}