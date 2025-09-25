// src/layout/LayoutByRole.jsx
import { useAuth } from "../context/AuthProvider";
import { MENU_BY_ROLE, TITLES_BY_ROLE } from "./menuConfig";
import AppLayout from "./BaseLayout";


export default function LayoutByRole() {
  const { user, role } = useAuth();
  const r = String(role || "user").toLowerCase();

  const menuItems = MENU_BY_ROLE[r] || MENU_BY_ROLE.user;
  const title = TITLES_BY_ROLE[r] || "Panel";

  return <AppLayout title={title} menuItems={menuItems} currentUser={user} />;
}
