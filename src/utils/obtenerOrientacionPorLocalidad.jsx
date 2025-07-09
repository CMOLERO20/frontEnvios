import localidades from "./localidades";

const normalizarTexto = (texto) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const obtenerOrientacionPorLocalidad = (nombreLocalidad) => {
  const normalizado = normalizarTexto(nombreLocalidad || "");
  const localidad = localidades.find(
    (l) => normalizarTexto(l.nombre) === normalizado
  );
  return localidad?.orientacion || null;
};

export default obtenerOrientacionPorLocalidad;