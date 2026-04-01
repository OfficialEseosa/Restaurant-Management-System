import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landingpage from './app/landingpage'
import LoginPage from './app/loginpage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
