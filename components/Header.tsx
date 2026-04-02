'use client'

export default function Header() {
  return (
    <div style={container}>
      <img src="/mint.png" style={logo} />
      <h1 style={title}>Mint Orthodontics Cascade Impact Report</h1>
      <img src="/ce.png" style={logo} />
    </div>
  )
}

const container = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  borderBottom: '1px solid #1F2937',
  backgroundColor: '#000000'
}

const logo = {
  height: 40
}

const title = {
  fontSize: 18,
  fontWeight: 600,
  flex: 1,
  textAlign: 'center' as const,
  color: '#FFFFFF'
}