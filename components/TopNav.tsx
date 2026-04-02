'use client'

import { useRouter, usePathname } from 'next/navigation'

const users = [
  { name: 'Mari', path: '/mari' },
  { name: 'Emily', path: '/emily' },
  { name: 'TC Team', path: '/tc' },
  { name: 'Jordyn', path: '/jordyn' },
  { name: 'Olivia', path: '/olivia' },
  { name: 'Ashley', path: '/ashley' },
  { name: 'Alli', path: '/alli' },
  { name: 'Kelle', path: '/kelle' },
  { name: 'Ashlynn', path: '/ashlynn' },
  { name: 'Eric', path: '/eric' }
]

export default function TopNav() {
  const router = useRouter()
  const pathname = usePathname()

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
            backgroundColor: isActive ? '#F97316' : '#111827'
          }}
        >
          {user.name}
        </button>
      )
    })}
  </div>

  <img src="/ce.png" style={logoImg} />
</div>
    </div>
  )
}

const navContainer = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 20px',
  backgroundColor: '#000',
  borderBottom: '1px solid #1F2937'
}

const left = {
  display: 'flex',
  alignItems: 'center',
  gap: 10
}

const logo = {
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

const title = {
  fontWeight: 600,
  color: '#fff'
}

const right = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap'
}

const button = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #1F2937',
  color: '#fff',
  cursor: 'pointer'
}

const logoImg = {
  height: 40
}

const selectorRow = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap'
}