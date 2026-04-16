import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/loginpage.css'

const API_BASE = 'http://localhost:8080/api/users'

function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      if (data.role !== 'ADMIN') {
        setError('This account does not have admin access')
        return
      }

      localStorage.setItem('user', JSON.stringify(data))
      navigate('/admin')
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-logo">RMS</h1>
        <h2 className="login-title">Admin Portal</h2>
        <p className="login-sub">Sign in with your admin credentials</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Admin username"
            required
            className="login-input"
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            required
            className="login-input"
          />

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
        </form>

        <a href="/" className="login-home-link">Back to home</a>
      </div>
    </div>
  )
}

export default AdminLogin
