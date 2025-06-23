// src/auth/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const docRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(docRef);
      const userData = userDoc.data();

      if (allowedRoles.includes(userData.role)) {
        setAuthorized(true);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [allowedRoles]);

  if (loading) return <Spinner fullscreen texto="Cargando la aplicación..."></Spinner>;

  return authorized ? children : <Navigate to="/login" />;
}
