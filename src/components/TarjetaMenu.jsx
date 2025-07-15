import { useNavigate } from "react-router-dom";
import { useState } from "react";


export default function TarjetaMenu({categorias}) {
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(null);

  const handleCategoriaClick = (categoria) => {
    if (categoria.ruta) {
      navigate(categoria.ruta);
    } else {
      setModalAbierto(categoria);
    }
   }

  return (
  <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Panel de Administración</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categorias.map((cat) => (
          <div
            key={cat.nombre}
            onClick={handleCategoriaClick.bind(null, cat)}
            className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-gray-800">{cat.nombre}</h3>
          </div>
        ))}
      </div>

      {/* Modal de subcategorías */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
              onClick={() => setModalAbierto(null)}
            >
              &times;
            </button>
            <h4 className="text-lg font-semibold mb-4">{modalAbierto.nombre}</h4>
            <div className="space-y-3">
              {modalAbierto.subrutas.map((sub) => (
                <button
                  key={sub.ruta}
                  onClick={() => {
                    setModalAbierto(null);
                    navigate(sub.ruta);
                  }}
                  className="w-full text-left bg-blue-100 hover:bg-blue-200 p-2 rounded"
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}