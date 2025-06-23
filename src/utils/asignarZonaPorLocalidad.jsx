import localidades from "./localidades";

const asignarZonaPorLocalidad = (localidad) => {
  if (!localidad) return "";

  const normalizada = localidad.trim().toLowerCase();

  const encontrada = localidades.find(
    (loc) => loc.nombre.trim().toLowerCase() === normalizada
  );

  return encontrada?.zona || "";
};

export default asignarZonaPorLocalidad;