'use client'

import { useState } from 'react'
import TopNav from '@/components/TopNav'
import { supabase } from '../../lib/supabase'

export default function PracticeTrendsPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [tableData, setTableData] = useState<Record<string, string>>({})
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
const handleSave = async () => {
  const rows = Object.entries(tableData).map(([key, value]) => {
    const [month, year] = key.split('-')

    return {
      metric_type: 'Production',
      month_name: month,
      year_value: Number(year),
      metric_value: Number(
        value
          .replace(/\$/g, '')
          .replace(/,/g, '')
      ) || 0
    }
  })

  const { error } = await supabase
    .from('practice_trends_data')
    .upsert(rows)

  if (error) {
    console.error('SAVE ERROR:', error)
    return
  }

  setIsEditing(false)
  console.log('Saved successfully')
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
  onClick={() => {
    if (isEditing) {
      handleSave()
    } else {
      setIsEditing(true)
    }
  }}
>
  {isEditing ? 'Save' : 'Edit'}
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
  value={tableData[`${month}-${year}`] || ''}
  onChange={(e) => {
    setTableData({
      ...tableData,
      [`${month}-${year}`]: e.target.value
    })
  }}
  onBlur={(e) => {
    const formatted = formatCurrency(e.target.value)

    setTableData({
      ...tableData,
      [`${month}-${year}`]: formatted
    })
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
  justifyContent: 'flex-end',
  marginTop: 18
}

const editButton: React.CSSProperties = {
  backgroundColor: '#1E266D',
  color: '#FFFFFF',
  border: 'none',
  padding: '12px 22px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  minWidth: 110
}