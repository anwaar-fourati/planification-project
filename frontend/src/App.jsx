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
import Tasks from './pages/Tasks';
import ProjectCalendar from './pages/ProjectCalendar';

// --- Importation des Composants de Routage ---
import MainLayout from './layout/MainLayout'
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ResetPassword from './pages/ResetPassword';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          
          {/* --- ROUTES PUBLIQUES --- */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgotpassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/resetpassword/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/" element={<Home />} />

          {/* --- ROUTES PROTÉGÉES --- */}
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
            path="/role"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Role />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Project Tasks Route */}
          <Route 
            path="/projects/:projectId/tasks" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Tasks />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* Project Calendar Route */}
          <Route 
            path="/projects/:projectId/calendar" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProjectCalendar />
                </MainLayout>
              </ProtectedRoute>
            } 
          />


          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App