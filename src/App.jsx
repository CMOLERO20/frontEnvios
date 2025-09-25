import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import Register from "./auth/Register";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";


import CrearCliente from "./views/CrearCliente";


import CrearEnviosMultiplesM from "./components/material/CrearEnviosMultiplesM";
import VistaEnvios from "./views/VistaEnvios";
import VistaClienteById from "./views/VistaClienteById";
import VistaClientes from "./views/VistaClientes";
import VistaPagos from "./views/VistaPagos";
import TablaAdmin from "./components/material/TablaAdmin";

import AsignarRepartidor from "./views/AsignarRepartidor";


import ConfirmarPagosTransferencia from "./components/material/ConfirmarPagosTransferencia";


import RegistrosPage from "./views/RegistrosPage";
import UsuariosAdmin from "./views/UsuariosAdmin";
import CrearEnvioManual from "./components/material/CrearEnvioManual";
import ClienteMisEnvios from "./views/ClientesMisEnvios";
import { AuthProvider } from "./context/AuthProvider";
import LayoutByRole from "./layout/LayoutByRole";
import RegistroDiarioConFotos from "./components/material/RegistroDiarioConFoto";
export default function App() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <AuthProvider>
      <Router>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
  element={
    <ProtectedRoute allowedRoles={["admin", "user", "client", "moto"]}>
      <LayoutByRole />
    </ProtectedRoute>
  }



    > 
      {/* Admin con layout */}
          <Route
            path="/admin"
           
          >
            <Route index element={<RegistrosPage />} />
            <Route path="crear-multiples" element={<CrearEnviosMultiplesM />} />
          <Route path="crear-ocr" element={<RegistroDiarioConFotos/>} />
             <Route path="crear-manual" element={<CrearEnvioManual />} />
            <Route path="envios" element={<VistaEnvios />} />
            <Route path="clientes" element={<VistaClientes />} />
             <Route path="usuarios" element={<UsuariosAdmin />} />
            <Route path="clientes/:id" element={<VistaClienteById />} />
            <Route path="pagos" element={<VistaPagos />} />
            <Route path="crear-cliente" element={<CrearCliente />} />
            <Route path="tabla" element={<TablaAdmin />} />
           
             <Route path="asignar-envios" element={<AsignarRepartidor />} />
              <Route path="confirmar-transferencia" element={<ConfirmarPagosTransferencia />} />
            
                <Route path="registros" element={<RegistrosPage />} />
          </Route>

          {/* Clientes */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
               <ClienteMisEnvios/>
              </ProtectedRoute>
            }
            >

            <Route index element={<ClienteMisEnvios/>} />

            </Route>
            
          
          

          {/* Moto */}
          <Route
            path="/repartidor"
            element={
              <ProtectedRoute allowedRoles={["repartidor"]}>
                
              </ProtectedRoute>
            }
          />
        
     </Route>
          
        

          {/* Catch-all → login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
      </AuthProvider>
    </SnackbarProvider>
  );
}