import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { logout } from "../services/authService";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Récupérer les infos de l'utilisateur depuis localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // TODO: Implémenter la logique de recherche
    }
  };

  // Gérer la navigation vers le profil
  const handleProfileClick = () => {
    setUserMenuOpen(false);
    navigate('/profile');
  };

  // Gérer la navigation vers les paramètres
  const handleSettingsClick = () => {
    setUserMenuOpen(false);
    navigate('/settings');
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="shadow-sm border-b dark:border-gray-700 px-6 py-4" style={{ background: "var(--sidebar-bg)" }}>
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
              style={{ color: "var(--navbar-search-text)" }}
            />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                background: "var(--navbar-search-bg)",
                color: "var(--navbar-search-text)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            />
          </form>
        </div>

        <div className="ml-4 relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            style={{ color: "var(--sidebar-text)" }}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <UserCircleIcon className="w-8 h-8" />
            {user && (
              <span className="hidden sm:inline-block text-sm font-medium">
                {user.prenom || user.nom || 'User'}
              </span>
            )}
          </button>
          
          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-2 z-50 animate-fadeIn"
              style={{ 
                background: "var(--page-bg)", 
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
              }}
            >
              {/* User Info Header */}
              {user && (
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold" style={{ color: "var(--sidebar-text)" }}>
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {user.email}
                  </p>
                </div>
              )}

              {/* Menu Items */}
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                style={{ color: "var(--sidebar-text)" }}
              >
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Profile
              </button>

              <button
                onClick={handleSettingsClick}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                style={{ color: "var(--sidebar-text)" }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS pour l'animation du menu */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}