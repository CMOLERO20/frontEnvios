import React from "react";
import HistorialEnvio from "./HistorialEnvio";

export default function DetalleEnvioModal({ envio, onClose }) {
  if (!envio) return null;

  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalle del Envío</h2>

        <div className="space-y-3 text-sm text-gray-700">
          <p><strong>Número de Envío:</strong> {envio.numeroEnvio}</p>
          <p><strong>Estado:</strong> {envio.estado}</p>
          <p><strong>Remitente:</strong> {envio.senderName}</p>
          
          <p><strong>Destinatario:</strong> {envio.recieverName} <strong>/ DNI:</strong> {envio.recieverDni || "-"}</p>
          <p><strong>Teléfono destinatario:</strong> {envio.recieverPhone}</p>
          <p><strong>Dirección:</strong> {envio.recieverAddress}  <strong>/ Localidad:</strong> {envio.localidad}</p>
          <p><strong>Zona:</strong> {envio.zona}</p>
          <p><strong>Precio:</strong> ${envio.precio}</p>
          {envio.flex && (
  <p className="text-sm text-blue-600 font-semibold">Envío Flex</p>
)}
          {envio.recibidoPor && (
            <>
              <p className="mt-2 font-semibold">Datos de entrega:</p>
              <p><strong>Nombre:</strong> {envio.recibidoPor.nombre}</p>
              <p><strong>DNI:</strong> {envio.recibidoPor.dni}</p>
              <p><strong>Tipo:</strong> {envio.recibidoPor.tipo}</p>
            </>
          )}
          
  <HistorialEnvio envioId={envio.id} />

        </div>
      </div>
    </div>
  );
}