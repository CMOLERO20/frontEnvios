import { InboxIcon, CubeIcon, TruckIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";

const icons = {
  "Pendientes": <InboxIcon className="h-6 w-6 text-yellow-500" />,
  "Envíos activos": <CubeIcon className="h-6 w-6 text-blue-500" />,
  "En viaje": <TruckIcon className="h-6 w-6 text-indigo-500" />,
  "Entregados": <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  "Demorados": <ExclamationCircleIcon className="h-6 w-6 text-red-500" />,
};

export default function ContadorEnvios({
  envios,
  estado,
  titulo,
  color = "text-blue-600",
}) {

  const estados = Array.isArray(estado) ? estado : [estado];
const cantidad = envios.filter((e) =>
  e.demorado
    ? e.activo === true
    : e.activo === true && estados.includes(e.estado)
).length;
  return (
  <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex items-center gap-4 max-w-[250px] sm:max-w-sm w-full">
  <div className="bg-blue-50 rounded-full p-2 sm:p-3 flex items-center justify-center">
    {icons[titulo] || <InboxIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />}
  </div>
  <div>
    <p className="text-sm sm:text-base text-gray-700 font-semibold">{titulo}</p>
    <p className={`text-xl sm:text-2xl font-bold ${color}`}>{cantidad}</p>
  </div>
</div>
  );
}