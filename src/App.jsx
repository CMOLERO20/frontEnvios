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
import CrearEnviosOCRV2 from "./views/CrearEnviosOCRV2";
import CrearEnviosMultiplesM from "./components/material/CrearEnviosMultiplesM";

import dotenv from 'dotenv';
import VistaEnvios from "./views/VistaEnvios";
import VistaClienteById from "./views/VistaClienteById";
import VistaClientes from "./views/VistaClientes";
import VistaPagos from "./views/VistaPagos";
import TablaAdmin from "./components/material/TablaAdmin";

import { SnackbarProvider } from 'notistack';


export default function App() {
  
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
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
        <Route path="/admin/envios" element={<VistaEnvios />} />
        <Route path="/admin/clientes/" element={<VistaClientes/>} />
         <Route path="/admin/clientes/:id" element={<VistaClienteById  />} />
         <Route path="/admin/pagos/" element={<VistaPagos  />} />

<Route path="/admin/crear-multiples" element={<CrearEnviosMultiplesM />} />
<Route path="/admin/crear-envios-ocr" element={<CrearEnviosOCR />} />
<Route path="/admin/crear-envios-ocr-v2" element={<CrearEnviosOCRV2 />} />
 <Route
          path="/tabla"
          element={
            <ProtectedRoute allowedRoles={["admin",'client']}>
              <TablaAdmin></TablaAdmin>
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
      </SnackbarProvider>
  );
}
