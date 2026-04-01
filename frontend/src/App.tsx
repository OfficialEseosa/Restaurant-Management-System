import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landingpage from './app/landingpage'
import LoginPage from './app/loginpage'
import AdminLogin from './app/adminlogin'
import Dashboard from './app/dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
