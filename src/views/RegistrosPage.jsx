import React from "react";
import RegistroEnviosForm from "../components/material/RegistroEnviosForm";
import RegistrosDelDia from "../components/material/RegistrosDelDia";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

export default function RegistrosPage() {
  const [user, setUser] = useState(null);
 
  return (
    <div className="p-4">
      <RegistroEnviosForm user={user}/>
      <RegistrosDelDia />
    </div>
  );
}
