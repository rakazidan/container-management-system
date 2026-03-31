import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Monitoring from './pages/Monitoring'
import MonitoringCanvas from './pages/MonitoringCanvas'
import Master from './pages/Master'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/monitoring-canvas" element={<MonitoringCanvas />} />
          <Route path="/master" element={<Master />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
