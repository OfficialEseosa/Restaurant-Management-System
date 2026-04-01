import React, { useState } from 'react'
import '../styles/loginpage.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire up authentication
    console.log('Login:', email, password)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-logo"> *Placeholder*</h1>
        <h2 className="login-title">Welcome</h2>
        <p className="login-sub">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="login-input"
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="login-input"
          />

          <button type="submit" className="login-btn">Sign In</button>
        </form>

        <p className="login-footer">
          <a href="/" className="login-link"> Back to home</a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
