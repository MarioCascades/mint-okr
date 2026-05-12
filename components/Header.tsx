'use client'

import { COLORS } from '@/lib/colors'

export default function Header() {
  return (
    <div style={container}>
      <img src="/mint.png" style={logo} />
      <h1 style={title}>Mint Orthodontics Cascade Impact Report</h1>
      <img src="/ce.png" style={logo} />
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  borderBottom: `2px solid ${COLORS.orangeSoft}`,
  backgroundColor: COLORS.navy,
  boxShadow: COLORS.shadowSoft
}

const logo: React.CSSProperties = {
  height: 40
}

const title: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  flex: 1,
  textAlign: 'center',
  color: COLORS.white
}