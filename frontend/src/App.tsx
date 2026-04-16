import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landingpage from './app/landingpage';
import LoginPage from './app/loginpage';
import CustomerDashboard from './app/CustomerDashboard';
import MenuPage from './app/MenuPage';
import OrderHistoryPage from './app/OrderHistoryPage';
import AdminDashboard from './app/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"       element={<Landingpage />} />
        <Route path="/login"  element={<LoginPage />} />

        {/* Customer */}
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/menu"      element={<MenuPage />} />
        <Route path="/orders"    element={<OrderHistoryPage />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Legacy redirect — keep /admin working during transition */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
