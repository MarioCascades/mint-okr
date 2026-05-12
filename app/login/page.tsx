'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { COLORS } from '@/lib/colors'

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

 // ================= ROLE DETECTION =================

const loggedInEmail =
  data.user?.email?.toLowerCase()

if (
  loggedInEmail ===
    'mario@cascadeffects.com' ||
  loggedInEmail ===
    'okradmin@mintortho.com'
) {
  localStorage.setItem('userRole', 'admin')
}

else if (
  loggedInEmail ===
    'okrapp@mintortho.com'
) {
  localStorage.setItem('userRole', 'member')
}

// ================= REDIRECT =================

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
  backgroundColor: COLORS.grayAppBackground,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 40,
  backgroundImage:
    "linear-gradient(rgba(30,38,109,0.22), rgba(30,38,109,0.22)), url('/images/mainbanner.png')",
  backgroundSize: '88%',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat'
}

const card: React.CSSProperties = {
  width: 420,
  background: 'rgba(255,255,255,0.96)',
  padding: 40,
  borderRadius: 18,
  border: `2px solid ${COLORS.orangeSoft}`,
  boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
  position: 'relative',
  zIndex: 10
}

const title: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 10,
  color: COLORS.navy,
  textAlign: 'center'
}

const subtitle: React.CSSProperties = {
  fontSize: 14,
  color: COLORS.textMuted,
  marginBottom: 24,
  textAlign: 'center'
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 14,
  marginBottom: 14,
  borderRadius: 10,
  border: `1px solid ${COLORS.orangeSoft}`,
  fontSize: 15,
  backgroundColor: COLORS.orangeTint,
  color: COLORS.textPrimary,
  outline: 'none',
  fontWeight: 500
}

const button: React.CSSProperties = {
  width: '100%',
  padding: 14,
  border: 'none',
  borderRadius: 10,
  backgroundColor: COLORS.orangePrimary,
  color: COLORS.white,
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer'
}

const errorText: React.CSSProperties = {
  color: '#DC2626',
  marginBottom: 14,
  fontSize: 14
}