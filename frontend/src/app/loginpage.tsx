import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../styles/loginpage.css'

const API_BASE = 'http://localhost:8080/api/users'

function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsSignUp(searchParams.get('mode') === 'signup')
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const endpoint = isSignUp ? '/register' : '/login'
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      localStorage.setItem('user', JSON.stringify(data))
      navigate(data.role === 'ADMIN' ? '/admin' : '/order')
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
        <h2 className="login-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-sub">
          {isSignUp ? 'Sign up to start ordering' : 'Sign in to your account'}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            className="login-input"
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="login-input"
          />

          {isSignUp && (
            <>
              <label className="login-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="login-input"
              />
            </>
          )}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button className="login-toggle" onClick={() => setIsSignUp(false)}>
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button className="login-toggle" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </>
          )}
        </p>

        <a href="/" className="login-home-link">Back to home</a>
      </div>
    </div>
  )
}

export default LoginPage
