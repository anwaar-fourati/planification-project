import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

// --- Importation des Pages ---
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Projects from './pages/Projects'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Role from './pages/Role'
import Home from './pages/Home'

// --- Importation des Composants de Routage ---
import MainLayout from './layout/MainLayout'
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute'; // On importe notre nouveau garde
import ResetPassword from './pages/ResetPassword';

function App() {
  // On peut supprimer le useEffect qui faisait un fetch, il n'est plus utile ici.

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          
          {/* --- ROUTES PUBLIQUES --- */}
          {/* Ces pages sont inaccessibles si on est déjà connecté */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgotpassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/resetpassword/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* La page d'accueil peut rester publique pour tout le monde */}
          <Route path="/" element={<Home />} />


          {/* --- ROUTES PROTÉGÉES --- */}
          {/* Tout ce qui est ici nécessite d'être connecté */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Projects />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/role" // Si cette page doit aussi être protégée
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Role />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* --- REDIRECTION PAR DÉFAUT --- */}
          {/* Si aucune autre route ne correspond, on redirige vers la page d'accueil */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App