import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClients } from "../utils/getClients";
import FiltroBusqueda from "../components/elementos/FiltroBusqueda";
import TarjetaResumen from "../components/elementos/TarjetaResumen";

export default function VistaClientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClients();
        setClientes(data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter((c) =>
    [c.nombre, c.email].some((campo) =>
      campo?.toLowerCase().includes(filtro.toLowerCase())
    )
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">👥 Clientes</h2>

      <FiltroBusqueda value={filtro} onChange={(e) => setFiltro(e.target.value)} />

      <div className="grid gap-3 mt-4">
        {clientesFiltrados.map((cliente) => (
          <TarjetaResumen
            key={cliente.uid}
            titulo={cliente.nombre || cliente.email}
            subtitulo={`Email: ${cliente.email} cliente id: ${cliente.uid}`}
            onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
          />
        ))}
      </div>
    </div>
  );
}