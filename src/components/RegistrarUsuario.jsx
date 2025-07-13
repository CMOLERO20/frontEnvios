import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function RegistroUsuario({ rol }) {
const [form, setForm] = useState({
nombre: "",
telefono: "",
email: "",
password: "",
});
const [error, setError] = useState("");
const navigate = useNavigate();
const [cargando, setCargando] = useState(false);

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const validar = () => {
const { nombre, telefono, email, password } = form;
if (!nombre.trim()) return "El nombre y apellido es obligatorio";
if (!/^\d+$/.test(telefono) || telefono.length < 8)
return "Teléfono inválido (solo números, al menos 8 cifras)";
if (!/\S+@\S+.\S+/.test(email)) return "Email inválido";
if (password.length < 6)
return "La contraseña debe tener al menos 6 caracteres";
return null;
};

const handleSubmit = async (e) => {
e.preventDefault();
setError("");

const err = validar();
if (err) return setError(err);

try {
    setCargando(true)
  const cred = await createUserWithEmailAndPassword(
    auth,
    form.email,
    form.password
  );
  await setDoc(doc(db, "usuarios", cred.user.uid), {
    uid: cred.user.uid,
    email: form.email,
    nombre: form.nombre,
    telefono: form.telefono,
    role: rol,
    cuentaCorriente: 0, // Inicializar cuenta corriente en 0
  });
  navigate("/admin");
} catch (err) {
  setError(err.message);
}finally {
    setCargando(false);
  }
};

return (
<div className="max-w-md mx-auto p-6 shadow-lg rounded-lg">
  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
    Registro {rol === "client" ? "de Cliente" : "de Repartidor"}
  </h2>

  <form onSubmit={handleSubmit} className="grid gap-4 text-sm">
    <div>
      <label className="block mb-1 text-gray-700">Nombre y Apellido*</label>
      <input
        type="text"
        name="nombre"
        placeholder="Ej: Juan Pérez"
        value={form.nombre}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label className="block mb-1 text-gray-700">Teléfono*</label>
      <input
        type="text"
        name="telefono"
        placeholder="Ej: 11-1234-5678"
        value={form.telefono}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label className="block mb-1 text-gray-700">Email*</label>
      <input
        type="email"
        name="email"
        placeholder="Ej: correo@ejemplo.com"
        value={form.email}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label className="block mb-1 text-gray-700">Contraseña*</label>
      <input
        type="password"
        name="password"
        placeholder="Mínimo 6 caracteres"
        value={form.password}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    {error && (
      <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>
    )}

    <div className="flex justify-between gap-4 mt-4">
      <button
        type="submit"
        disabled={cargando}
        className="bg-blue-600 text-white flex-1 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {cargando ? "Registrando..." : "Registrar"}
      </button>

      <button
        type="button"
        onClick={() => navigate("/admin")}
        className="bg-gray-300 text-black flex-1 py-2 rounded hover:bg-gray-400 transition"
        disabled={cargando}
      >
        Cancelar
      </button>
    </div>
  </form>
</div>
);
}

export function RegistrarCliente() {
return <RegistroUsuario rol="client" />;
}

export function RegistrarRepartidor() {
return <RegistroUsuario rol="moto" />;
}