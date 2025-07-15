import { useState } from "react";

export default function SelectorMetodoPago({ onMetodoSeleccionado }) {
  const [metodo, setMetodo] = useState("");

  const handleChange = (e) => {
    const valor = e.target.value;
    setMetodo(valor);
    if (onMetodoSeleccionado) onMetodoSeleccionado(valor);
  };

  return (
    <div className="border rounded-lg p-3 shadow-sm bg-white mb-4">
      <label className="block font-semibold text-gray-700 mb-2">
        💳 Método de Pago
      </label>
      <select
        value={metodo}
        onChange={handleChange}
        className="border border-gray-300 rounded p-2 w-full"
      >
        <option value="">Elegir método de pago...</option>
        <option value="efectivo">Efectivo</option>
        <option value="transferencia">Transferencia</option>
        <option value="cuenta_corriente">Cuenta Corriente</option>
      </select>
    </div>
  );
}