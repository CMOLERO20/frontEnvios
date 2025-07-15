export default function FiltroBusqueda({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md p-2 mb-4"
    />
  );
}