import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'; // Une icône pour le bouton
import {
  HomeIcon,
  CheckCircleIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";


const menuItems = [
  { icon: HomeIcon, label: "Home", path: "/" },
  { icon: CheckCircleIcon, label: "My Projects", path: "/projects" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ChatBubbleLeftRightIcon, label: "Messages", path: "/messages" },
  { icon: UsersIcon, label: "Meetings", path: "/meetings" },
  { icon: Cog6ToothIcon, label: "Settings", path: "/settings" },
];

export default function Sidebar({ isCollapsed, setCollapsed }) {
  const { theme, toggle } = useContext(ThemeContext);
  const navigate = useNavigate(); // 2. Préparer la redirection

  // 3. Créer la fonction qui gère le clic sur le bouton
  const handleLogout = () => {
    logout(); // Appelle la fonction qui nettoie le localStorage
    navigate('/'); // Redirige l'utilisateur vers la page de connexion
    // Optionnel: vous pouvez aussi rafraîchir la page pour être sûr que tout l'état est réinitialisé
    // window.location.reload(); 
  };
  return (
    <div className={`flex flex-col h-full transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between" style={{ background: "var(--sidebar-bg)" }}>
        {!isCollapsed && <div className="text-xl font-bold" style={{ color: "var(--sidebar-text)" }}>UNISION</div>}
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5" style={{ color: "var(--sidebar-icon)" }} /> : <ChevronDoubleLeftIcon className="w-5 h-5" style={{ color: "var(--sidebar-icon)" }} />}
        </button>
      </div>

      <nav className="flex-1 p-2" style={{ background: "var(--sidebar-bg)" }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center w-full p-3 rounded-lg mb-1 transition-colors ${isCollapsed ? "justify-center" : ""} ${
                  isActive ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md" : ""
                }`
              }
              title={isCollapsed ? item.label : ""}
            >
              <Icon className="w-5 h-5" style={{ color: "var(--sidebar-icon)" }} />
              {!isCollapsed && <span className="font-medium ml-3" style={{ color: "var(--sidebar-text)" }}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t dark:border-gray-700" style={{ background: "var(--sidebar-bg)" }}>
        <button
          onClick={toggle}
          className={`flex items-center w-full p-3 rounded-lg transition-colors ${isCollapsed ? "justify-center" : ""}`}
        >
          {theme === "dark" ? <SunIcon className="w-5 h-5" style={{ color: "var(--sidebar-icon)" }} /> : <MoonIcon className="w-5 h-5" style={{ color: "var(--sidebar-icon)" }} />}
          {!isCollapsed && <span className="font-medium ml-3" style={{ color: "var(--sidebar-text)" }}>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
        </button>

        <button className={`flex items-center w-full p-3 rounded-lg transition-colors mt-2`} onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="w-5 h-5" style={{ color: "var(--sidebar-icon)" }} />
          {!isCollapsed && <span className="font-medium ml-3" style={{ color: "var(--sidebar-text)" }}>Log out</span>}
        </button>
      </div>
    </div>
  );
}
