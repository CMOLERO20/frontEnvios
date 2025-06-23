// src/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Traer el rol del usuario desde Firestore
      const docSnap = await getDoc(doc(db, "usuarios", uid));
      const rol = docSnap.data().role;

      // Redirigir
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (rol === "admin") navigate("/admin", { replace: true });
        if (rol === "client") navigate("/client", { replace: true });
        if (rol === "moto") navigate("/moto", { replace: true });
      }
    } catch (error) {
      console.error("Error al ingresar:", error);
      alert("Error de login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-5">
    <h2 className="text-2xl font-bold text-center text-gray-800">Iniciar sesión</h2>

    <div className="space-y-3">
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>

    <button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
      onClick={handleLogin}
    >
      Ingresar
    </button>
  </div>
</div>
  );
}