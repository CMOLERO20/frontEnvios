import React from "react";
import { useNavigate } from "react-router-dom";

export default function BotonCrearEnvio() {
  const navigate = useNavigate();

  const irACrearEnvio = () => {
    navigate("/crear-envio");
  };

  return (
   <button
  className="bg-green-600 text-white px-4 py-2 rounded-md shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
  onClick={irACrearEnvio}
>
  Crear Envío
</button>
  );
}