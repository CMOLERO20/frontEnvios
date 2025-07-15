import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function BotonVolver({ to = "/admin", soloIcono = false, flotante = false }) {
  const navigate = useNavigate();

  const baseClasses = "flex items-center text-sm text-blue-600 hover:underline";
  const flotanteClasses = "fixed top-4 left-4 z-50 bg-white shadow-md p-2 rounded-full";

  return (
    <button
      onClick={() => navigate(to)}
      className={`${baseClasses} ${flotante ? flotanteClasses : "mb-4"}`}
      title="Volver"
    >
      <ArrowLeftIcon className="w-5 h-5 mr-1" />
      {!soloIcono && !flotante && "Volver al panel"}
    </button>
  );
}