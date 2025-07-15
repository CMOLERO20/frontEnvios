import { useState, useEffect } from "react";

export default function SelectorMetodoPago({ onMetodoSeleccionado }) {
  const [metodo, setMetodo] = useState("");

  useEffect(() => {
    onMetodoSeleccionado(metodo);
  }, [metodo]);

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 space-y-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">💳 Método de Pago</h3>

      <select
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={''}
        onChange={(e) => setMetodo(e.target.value)}
       
      >
        <option value="efectivo">Efectivo</option>
        <option value="transferencia">Transferencia</option>
        <option value="cuenta_corriente">Cuenta corriente</option>
      </select>
    </div>
  );
}