// src/auth/Register.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("client");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      email,
      rol,
    });
    navigate("/login");
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">Registrarse</h2>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select
        className="border p-2 w-full mb-2"
        value={rol}
        onChange={(e) => setRol(e.target.value)}
      >
        <option value="client">Cliente</option>
        <option value="moto">Moto</option>
       
      </select>
      <button onClick={handleRegister} className="bg-blue-500 text-white px-4 py-2 w-full">
        Registrarse
      </button>
    </div>
  );
}
