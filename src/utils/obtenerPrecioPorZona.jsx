const obtenerPrecioPorZona = (zona) => {
  switch (zona) {
    case "CABA":
      return 3400;
    case "Primer Cordón":
      return 5400;
    case "Segundo Cordón":
      return 7300;
    case "Tercer Cordón":
      return 8300;
    default:
      return 0;
  }
};

export default obtenerPrecioPorZona