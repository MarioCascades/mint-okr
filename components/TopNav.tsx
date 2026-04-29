'use client'


import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

const users = [
  { name: 'Main', path: '/' },
  { name: 'Mari', path: '/mari' },
  { name: 'Emily', path: '/emily' },
  { name: 'TC Team', path: '/tc' },
  { name: 'Jordyn', path: '/jordyn' },
  { name: 'Heather', path: '/heather' },
  { name: 'Ashley', path: '/ashley' },
  { name: 'Alli', path: '/alli' },
  { name: 'Kelle', path: '/kelle' },
  { name: 'Ashlynn', path: '/ashlynn' },
  { name: 'Eric', path: '/eric' },
  { name: 'Olivia Historical', path: '/olivia' },
  { name: 'Tables', path: '/practice-trends' },
  { name: 'Charts', path: '/practice-trends/dashboard' }
]

export default function TopNav() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
  router.refresh()
}

  return (
    <div style={navContainer}>
      <div style={left}>
      <img src="/mint.png" style={logoImg} />
      <span style={title}>Mint Orthodontics</span>
      </div>

      <div style={right}>
  <div style={selectorRow}>
    {users.map((user) => {
      const isActive = pathname === user.path

      return (
        <button
          key={user.path}
          onClick={() => router.push(user.path)}
          style={{
  ...button,
  backgroundColor: isActive ? '#F97316' : '#FFFFFF',
  color: isActive ? '#1E266D' : '#F26C2F',
  border: '1px solid #F26C2F',
  fontWeight: isActive ? 700 : 500
}}

onMouseEnter={(e) => {
  if (!isActive) {
    e.currentTarget.style.backgroundColor = '#F9FAFB'
  }
}}
onMouseLeave={(e) => {
  if (!isActive) {
    e.currentTarget.style.backgroundColor = '#FFFFFF'
  }
}}
        >
          {user.name}
        </button>
      )
    })}
  </div>

  <div style={logoutSection}>
  <img src="/ce.png" style={logoImg} />

  <button
    onClick={handleLogout}
    style={logoutButton}
  >
    Logout
  </button>
</div>
</div>
    </div>
  )
}

const navContainer : React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 20px',
  backgroundColor: '#F3F4F6', // 👈 light grey
  borderBottom: '1px solid #E5E7EB',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
}

const left : React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10
}

const logo : React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: '#F97316',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  color: '#000'
}

const title: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: '#111827'
}

const right: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'space-between',
  marginLeft: 40
}

const button: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #F26C2F',
  backgroundColor: '#FFFFFF',
  color: '#1E266D',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 15,
  minWidth: 'fit-content'
}

const logoImg : React.CSSProperties = {
  height: 40
}

const selectorRow: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1
}

const logoutSection: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12
}

const logoutButton: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid #F26C2F',
  backgroundColor: '#FFFFFF',
  color: '#F26C2F',
  fontWeight: 700,
  cursor: 'pointer'
}