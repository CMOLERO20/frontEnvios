// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./auth/Register";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import AdminDashboard from "./views/AdminDashboard";
import MotoDashboard from "./views/MotoDashboard";
import UserEnvios from "./views/UserEnvios";
import MotoFinalizados from "./views/MotoFinalizados";
import CrearEnvio from "./views/CrearEnvios";

import { auth } from "./firebase";
import CrearCliente from "./views/CrearCliente";
import CrearEnviosMultiples from "./components/CrearEnviosMultiples";
import CrearEnviosOCR from "./views/CrearEnviosOCR";

import dotenv from 'dotenv';


export default function App() {
  
  return (
    <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protegidas */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
<Route path="/admin/crear-multiples" element={<CrearEnviosMultiples />} />
<Route path="/admin/crear-envios-ocr" element={<CrearEnviosOCR />} />
 <Route
          path="/crear-envio"
          element={
            <ProtectedRoute allowedRoles={["admin",'client']}>
              <CrearEnvio />
            </ProtectedRoute>
          }
        />
         <Route
          path="/crear-cliente"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CrearCliente/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <UserEnvios user={auth.currentUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moto"
          element={
            <ProtectedRoute allowedRoles={["moto"]}>
              <MotoDashboard />
            </ProtectedRoute>
          }
        />
<Route path="/moto/finalizados" element={<MotoFinalizados />} />

        {/* Ruta raíz -> login por defecto */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}
