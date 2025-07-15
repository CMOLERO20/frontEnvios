export default function TarjetaResumen({ titulo, subtitulo, descripcion, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-md shadow-sm bg-white hover:bg-gray-50 cursor-pointer"
    >
      <p><strong>{titulo}</strong></p>
      <p>{subtitulo}</p>
      {descripcion && <p className="text-sm text-gray-500">{descripcion}</p>}
    </div>
  );
}