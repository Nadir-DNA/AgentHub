import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import * as api from './services/api'
import AmbientCanvas from './components/AmbientCanvas'
import Layout from './components/Layout'
import UpdateChecker from './components/UpdateChecker'
import Hub from './pages/Hub'
import Agent from './pages/Agent'
import AgentConfig from './pages/AgentConfig'
import Settings from './pages/Settings'
import Wizard from './pages/Wizard'

function App() {
  return (
    <>
    <AmbientCanvas />
    <UpdateChecker />
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
    </>
  )
}

function RootRedirect() {
  // La source de vérité est la config Rust.
  const [view, setView] = useState<'loading' | 'hub' | 'wizard'>('loading')

  useEffect(() => {
    api
      .getConfig()
      .then(c => setView(c.installed ? 'hub' : 'wizard'))
      .catch(() => setView('wizard'))
  }, [])

  if (view === 'loading') {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }} />
  }
  if (view === 'wizard') {
    return <Navigate to="/wizard" replace />
  }
  return <Hub />
}

export default App