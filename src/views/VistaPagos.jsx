// VistaPagos.jsx
import { useEffect, useState } from "react";
import FiltroFecha from "../components/elementos/FiltroFecha";
import SelectorMetodoPago from "../components/SelectorMetodoPago";
import { getPagos } from "../utils/getPagos";
import BotonVolver from "../components/elementos/BotonVolver";
export default function VistaPagos() {
  const [pagos, setPagos] = useState([]);
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    const fetchPagos = async () => {
      const data = await getPagos();
      setPagos(data);
    };
    fetchPagos();
  }, []);

  const filtrados = pagos.filter((pago) => {
    const coincideMetodo = !filtroMetodo || pago.metodo === filtroMetodo;
  const coincideDesde = !fechaDesde || pago.fecha.toDate() >= new Date(fechaDesde);
  const coincideHasta = !fechaHasta || pago.fecha.toDate() <= new Date(fechaHasta);
  return coincideMetodo && coincideDesde && coincideHasta;
});
  const total = filtrados.reduce((acc, p) => acc + (p.monto || 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
        <BotonVolver soloIcono />
      <h2 className="text-2xl font-bold mb-4">💳 Pagos</h2>
<h1 className="text-1xl font-bold mb-4">Filtros</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-4">

        <FiltroFecha
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          setFechaDesde={setFechaDesde}
          setFechaHasta={setFechaHasta}
        />
        <SelectorMetodoPago
          metodoSeleccionado={filtroMetodo}
          onMetodoSeleccionado={setFiltroMetodo}
        />
      </div>

      <div className="text-sm text-gray-700 mb-4">
         <h1 className="text-1xl font-bold mb-4">💳 Pagos</h1>
        <p><strong>Movimientos:</strong> {filtrados.length}</p>
        <p><strong>Total:</strong> ${total.toLocaleString("es-AR")}</p>
      </div>

      <div className="grid gap-3">
        {filtrados.map((pago) => (
          <div key={pago.id} className="p-3 bg-white border rounded shadow-sm text-sm">
            <p><strong>Cliente:</strong> {pago.clienteNombre}</p>
            <p><strong>Monto:</strong> ${pago.monto}</p>
            <p><strong>Método:</strong> {pago.metodo}</p>
            <p><strong>Fecha:</strong> {pago.fecha?.toDate().toLocaleDateString()}</p>
            <p><strong>Estado:</strong> {pago.estado}</p>
          </div>
        ))}
      </div>
    </div>
  );
}