import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Récupérer l'item du localStorage
  const userString = localStorage.getItem('user');
  
  // Essayer de parser les données
  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    // Si le parsing échoue, on considère l'utilisateur comme non connecté
    user = null;
  }

  // La condition de protection : l'utilisateur doit exister ET avoir un token
  if (!user || !user.token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;