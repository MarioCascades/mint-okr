'use client'

import { useState } from 'react'
import TopNav from '@/components/TopNav'

export default function PracticeTrendsPage() {
    const [isEditing, setIsEditing] = useState(false)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

  const formatCurrency = (value: string) => {
  if (!value) return ''

  const numeric = value
    .replace(/\$/g, '')
    .replace(/,/g, '')

  const numberValue = Number(numeric)

  if (isNaN(numberValue)) return ''

  return `$${numberValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

  return (
    <div style={container}>
      <TopNav />

    <div style={headerBar}>
  <h1 style={headerTitle}>
    Practice Trends
  </h1>

  <p style={headerSubtitle}>
    Historical Production, Collections, and Starts
  </p>

  <div style={actionRow}>
    <button
      style={editButton}
      onClick={() => setIsEditing(true)}
    >
      Edit
    </button>

    <button
      style={saveButton}
      onClick={() => setIsEditing(false)}
    >
      Save
    </button>
  </div>
</div>

<div style={sectionCard}>
  <div style={sectionTitle}>
    Production
  </div>
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
  placeholder="$0.00"
  readOnly={!isEditing}
  onBlur={(e) => {
    e.target.value = formatCurrency(e.target.value)
  }}
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

const headerBar: React.CSSProperties = {
  backgroundColor: '#F26C2F',
  padding: 24,
  margin: 20,
  borderRadius: 14,
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
}

const headerTitle: React.CSSProperties = {
  fontSize: 40,
  fontWeight: 800,
  color: '#FFFFFF',
  marginBottom: 6
}

const headerSubtitle: React.CSSProperties = {
  color: '#FFFFFF',
  fontSize: 15,
  opacity: 0.95
}

const sectionCard: React.CSSProperties = {
  margin: '0 20px',
  marginBottom: 16
}

const sectionTitle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: '#1E266D'
}
const actionRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 18
}

const editButton: React.CSSProperties = {
  backgroundColor: '#1E266D',
  color: '#FFFFFF',
  border: 'none',
  padding: '10px 18px',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer'
}

const saveButton: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  color: '#F26C2F',
  border: 'none',
  padding: '10px 18px',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer'
}