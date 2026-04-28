'use client'

import TopNav from '@/components/TopNav'

export default function PracticeTrendsPage() {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const years = [2024, 2025, 2026]

  return (
    <div style={container}>
      <TopNav />

      <div style={header}>
        <h1 style={title}>Practice Trends</h1>
        <p style={subtitle}>
          Historical Production, Collections, and Starts
        </p>
      </div>

      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Month</th>
              {years.map((year) => (
                <th key={year} style={th}>
                  {year}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {months.map((month) => (
              <tr key={month}>
                <td style={monthCell}>{month}</td>

                {years.map((year) => (
                  <td key={year} style={td}>
                    <input
                      style={input}
                      placeholder="0"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f5f5f5'
}

const header: React.CSSProperties = {
  padding: 24
}

const title: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 800,
  color: '#1E266D'
}

const subtitle: React.CSSProperties = {
  color: '#6B7280',
  marginTop: 8
}

const tableWrapper: React.CSSProperties = {
  padding: 20,
  overflowX: 'auto'
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#FFFFFF',
  borderRadius: 12
}

const th: React.CSSProperties = {
  padding: 14,
  border: '1px solid #E5E7EB',
  backgroundColor: '#F26C2F',
  color: '#FFFFFF',
  fontWeight: 700,
  textAlign: 'center'
}

const td: React.CSSProperties = {
  padding: 10,
  border: '1px solid #E5E7EB',
  textAlign: 'center'
}

const monthCell: React.CSSProperties = {
  padding: 12,
  border: '1px solid #E5E7EB',
  fontWeight: 700,
  color: '#1E266D'
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 10,
  border: '1px solid #F6A27A',
  borderRadius: 8,
  textAlign: 'center',
  color: '#111827'
}