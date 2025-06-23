const formatearFecha = (timestamp) => {
  if (!timestamp) return "";
  const fecha = timestamp.toDate();
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default formatearFecha