import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landingpage from './app/landingpage'
import LoginPage from './app/loginpage'
import AdminPage from './app/adminpage'
import OrderPage from './app/orderpage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/order" element={<OrderPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
