
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Projects from './pages/Projects'
import MainLayout from './layout/MainLayout'


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        } />

        <Route path="/projects" element={
          <MainLayout>
            <Projects />
          </MainLayout>
          } />

        <Route path="/dashboard" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
          } />

      </Routes>
      </div>
    </Router>
  );
}

export default App
