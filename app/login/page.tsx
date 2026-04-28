'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

 const handleLogin = async () => {
    console.log('LOGIN BUTTON CLICKED')
  setLoading(true)
  setError('')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  console.log('LOGIN DATA:', data)
  console.log('LOGIN ERROR:', error)

  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }

 setLoading(false)
window.location.href = '/'
}

    return (
  <div style={container}>
    <form
      style={card}
      onSubmit={(e) => {
        e.preventDefault()
        handleLogin()
      }}
    >
      <h1 style={title}>Mint OKR Login</h1>

      <p style={subtitle}>
        Secure access for Mint Orthodontics team members
      </p>

      <input
        style={input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
      />

      <input
        style={input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p style={errorText}>
          {error}
        </p>
      )}

      <button
        type="submit"
        style={button}
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Login'}
      </button>
    </form>
  </div>
)

}

const container: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20
}

const card: React.CSSProperties = {
  width: 420,
  backgroundColor: '#FFFFFF',
  padding: 40,
  borderRadius: 18,
  border: '1px solid #F6A27A',
  boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
}

const title: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 10,
  color: '#1E266D',
  textAlign: 'center'
}

const subtitle: React.CSSProperties = {
  fontSize: 14,
  color: '#6B7280',
  marginBottom: 24,
  textAlign: 'center'
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 14,
  marginBottom: 14,
  borderRadius: 10,
  border: '1px solid #F6A27A',
  fontSize: 15,
  backgroundColor: '#F8FAFC',
  color: '#1F2937',
  outline: 'none',
  fontWeight: 500
}

const button: React.CSSProperties = {
  width: '100%',
  padding: 14,
  border: 'none',
  borderRadius: 10,
  backgroundColor: '#F26C2F',
  color: '#FFFFFF',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer'
}

const errorText: React.CSSProperties = {
  color: '#DC2626',
  marginBottom: 14,
  fontSize: 14
}