import React from "react";

export default function Spinner({ fullscreen = false, texto = "Cargando..." }) {
  const content = (
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      <p className="text-gray-700 text-sm">{texto}</p>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}