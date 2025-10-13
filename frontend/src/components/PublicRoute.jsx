import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Si l'utilisateur est connecté, on le redirige vers le dashboard
  if (user && user.token) {
    return <Navigate to="/dashboard" />;
  }

  // Sinon, on affiche la page publique demandée (Login, Signup, etc.)
  return children;
};

export default PublicRoute;