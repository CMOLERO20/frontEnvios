// src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // objeto FirebaseUser
  const [role, setRole] = useState(null);        // "admin" | "user" | "client" | "moto" | null
  const [loading, setLoading] = useState(true);  // mientras resolvemos sesión y rol

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        setLoading(true);
        setUser(fbUser);

        if (!fbUser) { setRole(null); return; }

        // 1) Intentar leer rol desde custom claims
        let claimsRole = null;
        try {
          const token = await getIdTokenResult(fbUser, true);
          claimsRole = token?.claims?.role ? String(token.claims.role).toLowerCase() : null;
        } catch { /* sin claims, seguimos */ }

        // 2) Si no hay claim, leemos Firestore (colección "usuarios", doc = uid)
        let docRole = null;
        if (!claimsRole) {
          const ref = doc(db, "usuarios", fbUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (data?.role) docRole = String(data.role).toLowerCase();
          }
        }

        setRole(claimsRole || docRole || "user"); // default "user" si no hay nada
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar en cualquier parte
export function useAuth() {
  return useContext(AuthContext);
}
