import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import Register from "./auth/Register";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import AdminDashboard from "./views/AdminDashboard";
import MotoDashboard from "./views/MotoDashboard";
import UserEnvios from "./views/UserEnvios";
import MotoFinalizados from "./views/MotoFinalizados";
import CrearCliente from "./views/CrearCliente";

import CrearEnviosOCR from "./views/CrearEnviosOCR";
import CrearEnviosOCRV2 from "./views/CrearEnviosOCRV2";
import CrearEnviosMultiplesM from "./components/material/CrearEnviosMultiplesM";
import VistaEnvios from "./views/VistaEnvios";
import VistaClienteById from "./views/VistaClienteById";
import VistaClientes from "./views/VistaClientes";
import VistaPagos from "./views/VistaPagos";
import TablaAdmin from "./components/material/TablaAdmin";
import CrearRepartidor from "./views/CrearRepartidor";
import AsignarRepartidor from "./views/AsignarRepartidor";
import AppLayout from "./views/AppLayout";
import { auth } from "./firebase";
import ConfirmarPagosTransferencia from "./components/material/ConfirmarPagosTransferencia";
import RegistrarPagoCuentaCorriente from "./components/material/RegistrarPagoCuentaCorriente";
import VistaCuentasCorrientes from "./views/VistaCuentasCorrientes";
import RegistrosPage from "./views/RegistrosPage";

export default function App() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <Router>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin con layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RegistrosPage />} />
            <Route path="crear-multiples" element={<CrearEnviosMultiplesM />} />
            <Route path="crear-envios-ocr" element={<CrearEnviosOCR />} />
            <Route path="crear-envios-ocr-v2" element={<CrearEnviosOCRV2 />} />
            <Route path="envios" element={<VistaEnvios />} />
            <Route path="clientes" element={<VistaClientes />} />
            <Route path="clientes/:id" element={<VistaClienteById />} />
            <Route path="pagos" element={<VistaPagos />} />
            <Route path="crear-cliente" element={<CrearCliente />} />
            <Route path="tabla" element={<TablaAdmin />} />
             <Route path="crear-repartidor" element={<CrearRepartidor />} />
             <Route path="asignar-envios" element={<AsignarRepartidor />} />
              <Route path="confirmar-transferencia" element={<ConfirmarPagosTransferencia />} />
               <Route path="registrar-pago-cc" element={<VistaCuentasCorrientes />} />
                <Route path="registros" element={<RegistrosPage />} />
          </Route>

          {/* Clientes */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <UserEnvios user={auth.currentUser} />
              </ProtectedRoute>
            }
          />

          {/* Moto */}
          <Route
            path="/moto"
            element={
              <ProtectedRoute allowedRoles={["moto"]}>
                <MotoDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/moto/finalizados" element={<MotoFinalizados />} />

          {/* Catch-all → login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}