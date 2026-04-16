import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landingpage from './app/landingpage'
import LoginPage from './app/loginpage'
import AdminLogin from './app/adminlogin'
import OrderPage from './app/orderpage'
import AdminPage from './app/adminpage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
