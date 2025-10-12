import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from './pages/Dashboard'   // ton fichier
import Login from './pages/Login'
import Projects from './pages/Projects'
import MainLayout from './layout/MainLayout'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Role from './pages/Role'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>

          {/* Page d'accueil */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          {/* Page des projets */}
          <Route
            path="/projects"
            element={
              <MainLayout>
                <Projects />
              </MainLayout>
            }
          />

          {/* Route vers /dashboard */}
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />

          {/* Page de connexion (sans layout) */}
          <Route
            path="/login"
            element={<Login />}
          />
           <Route
            path="/signup"
            element={<Signup />}
          />
           <Route
            path="/forgotpassword"
            element={<ForgotPassword />}
          />
           <Route
            path="/role"
            element={<Role />}
          />
          

        </Routes>
      </div>
    </Router>
  )
}

export default App
