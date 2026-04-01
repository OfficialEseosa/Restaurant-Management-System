import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../styles/dashboard.css'

interface UserData {
  userId: number
  username: string
  role: string
}

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(stored))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <span className="dashboard-logo">RMS</span>
        <div className="dashboard-nav-right">
          <span className="dashboard-user">{user.username}</span>
          <button className="dashboard-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <h1>Welcome, {user.username}</h1>
        <p className="dashboard-subtitle">Your dashboard is being built. Check back soon for menu browsing and ordering.</p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Browse Menu</h3>
            <p>Coming soon</p>
          </div>
          <div className="dashboard-card">
            <h3>My Orders</h3>
            <p>Coming soon</p>
          </div>
          <div className="dashboard-card">
            <h3>Account Settings</h3>
            <p>Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
