import React from "react";
import { useNavigate } from "react-router-dom";
import { RegistrarCliente } from "../components/RegistrarUsuario";
export default function CrearCliente() {
  const navigate = useNavigate();

  const handleExito = () => {
    alert("Cliente registrado correctamente");
    navigate("/admin"); // o donde prefieras redirigir
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-50 mt-10">
      <RegistrarCliente rol="client" onRegistroExitoso={handleExito} />
    </div>
  );
}