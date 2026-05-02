import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Calculator from './pages/Calculator'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/calculator" replace />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
