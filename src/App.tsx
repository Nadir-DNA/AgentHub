import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Hub from './pages/Hub'
import Agent from './pages/Agent'
import AgentConfig from './pages/AgentConfig'
import Settings from './pages/Settings'
import Wizard from './pages/Wizard'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RootRedirect />} />
          <Route path="agent/:id" element={<Agent />} />
          <Route path="agent/:id/config" element={<AgentConfig />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/wizard" element={<Wizard />} />
      </Routes>
    </HashRouter>
  )
}

function RootRedirect() {
  // Lecture synchrone du localStorage — pas d'état React, pas de stale state
  const saved = localStorage.getItem('agenthub-config')
  if (saved) {
    try {
      const config = JSON.parse(saved)
      if (config.installed) {
        return <Hub />
      }
    } catch {
      // Ignorer
    }
  }
  return <Navigate to="/wizard" replace />
}

export default App
