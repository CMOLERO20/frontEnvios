// src/layout/menuConfig.js
import {
  Assessment, LocalShipping, Add, People, ManageAccounts, Payments,
  FactCheck, AssignmentInd, Dashboard, Route, History
} from "@mui/icons-material";

export const MENU_BY_ROLE = {
  admin: [
    {
      label: "Dashboard",
      icon: <Assessment />,
      children: [
        { label: "Registros", path: "/admin/registros" },
         { label: "Registros Foto", path: "/admin/crear-ocr" },
      ],
    },
    {
      label: "Envíos",
      icon: <LocalShipping />,
      children: [
        { label: "Listado", path: "/admin/envios" },
        { label: "Crear manual", path: "/admin/crear-manual" },
      /*   { label: "Crear múltiples", path: "/admin/crear-multiples" },
        { label: "OCR", path: "/admin/crear-envios-ocr" },
        { label: "OCR v2", path: "/admin/crear-envios-ocr-v2" }, */
      ],
    },
    {
      label: "Clientes",
      icon: <People />,
      children: [
        { label: "Listado", path: "/admin/clientes" },
        { label: "Crear cliente", path: "/admin/crear-cliente" },
      ],
    },
   /*  {
      label: "Usuarios",
      icon: <ManageAccounts />,
      children: [
        { label: "Administrar", path: "/admin/usuarios" },
      ],
    }, */
    {
      label: "Pagos",
      icon: <Payments />,
      children: [
        { label: "Listado", path: "/admin/pagos" },
        { label: "Confirmar transferencia", path: "/admin/confirmar-transferencia" },
       /*  { label: "Registrar pago cta cte", path: "/admin/registrar-pago-cc" }, */
      ],
    },
   /*  {
      label: "Operaciones",
      icon: <AssignmentInd />,
      children: [
        { label: "Asignar envíos", path: "/admin/asignar-envios" },
        { label: "Tabla admin", path: "/admin/tabla" },
      ],
    }, */
  ],

  user: [
    {
      label: "Panel",
      icon: <Dashboard />,
      children: [
        { label: "Envíos", path: "/panel/envios" },
      ],
    },
    {
      label: "Envíos",
      icon: <LocalShipping />,
      children: [
        { label: "Crear manual", path: "/admin/crear-manual" }, // reutiliza el form
      ],
    },
  ],

  client: [
    {
      label: "Envios",
      icon: <LocalShipping />,
      children: [
        { label: "Mis envíos", path: "/cliente" },
        { label: "Crear envío", path: "/cliente/crear-envio" },
      ],
    },
  ],

  moto: [
    {
      label: "Moto",
      icon: <Route />,
      children: [
        { label: "Asignados", path: "/moto" },
        { label: "Finalizados", path: "/moto/finalizados" },
      ],
    },
  ],
};

export const TITLES_BY_ROLE = {
  admin: "Panel de Administración",
  user: "Panel de Operador",
  client: "Panel de Cliente",
  moto: "Panel Moto",
};
