'use client'

import { useState, useEffect } from 'react'
import TopNav from '@/components/TopNav'
import { supabase } from '../../lib/supabase'
import { isAdmin } from '@/lib/auth'
import { COLORS } from '@/lib/colors'

export default function PracticeTrendsPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [productionData, setProductionData] = useState<Record<string, string>>({})
  const [collectionsData, setCollectionsData] = useState<Record<string, string>>({})
  const [startsData, setStartsData] = useState<Record<string, string>>({})
  const [patientCollectionsData, setPatientCollectionsData] = useState<Record<string, string>>({})
  const [insuranceCollectionsData, setInsuranceCollectionsData] = useState<Record<string, string>>({})
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
  const productionRows = Object.entries(productionData).map(([key, value]) => {
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

  const collectionsRows = Object.entries(collectionsData).map(([key, value]) => {
    const [month, year] = key.split('-')

    return {
      metric_type: 'Collections',
      month_name: month,
      year_value: Number(year),
      metric_value: Number(
        value
          .replace(/\$/g, '')
          .replace(/,/g, '')
      ) || 0
    }
  })

 const startsRows = Object.entries(startsData).map(([key, value]) => {
  const [month, year] = key.split('-')

  return {
    metric_type: 'Starts',
    month_name: month,
    year_value: Number(year),
    metric_value: Number(
      value.replace(/,/g, '')
    ) || 0
  }
})

const patientCollectionsRows = Object.entries(patientCollectionsData).map(([key, value]) => {
  const [month, year] = key.split('-')

  return {
    metric_type: 'Patient Collections',
    month_name: month,
    year_value: Number(year),
    metric_value: Number(
      value
        .replace(/\$/g, '')
        .replace(/,/g, '')
    ) || 0
  }
})

const insuranceCollectionsRows = Object.entries(insuranceCollectionsData).map(([key, value]) => {
  const [month, year] = key.split('-')

  return {
    metric_type: 'Insurance Collections',
    month_name: month,
    year_value: Number(year),
    metric_value: Number(
      value
        .replace(/\$/g, '')
        .replace(/,/g, '')
    ) || 0
  }
})

const allRows = [
  ...productionRows,
  ...collectionsRows,
  ...startsRows,
  ...patientCollectionsRows,
  ...insuranceCollectionsRows
]

  const { error } = await supabase
    .from('practice_trends_data')
    .upsert(allRows, {
      onConflict: 'metric_type,month_name,year_value'
    })

  if (error) {
    console.error('SAVE ERROR:', error)
    return
  }

  setIsEditing(false)
  console.log('Saved successfully')
}
useEffect(() => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('practice_trends_data')
      .select('*')

    if (error) {
      console.error('FETCH ERROR:', error)
      return
    }

    const productionFormatted: Record<string, string> = {}
    const collectionsFormatted: Record<string, string> = {}
    const startsFormatted: Record<string, string> = {}
    const patientCollectionsFormatted: Record<string, string> = {}
    const insuranceCollectionsFormatted: Record<string, string> = {}

    data.forEach((row) => {
      const key = `${row.month_name}-${row.year_value}`

      if (row.metric_type === 'Production') {
        productionFormatted[key] = `$${Number(row.metric_value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      }

      if (row.metric_type === 'Collections') {
        collectionsFormatted[key] = `$${Number(row.metric_value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      }

      if (row.metric_type === 'Starts') {
        startsFormatted[key] = Number(row.metric_value).toLocaleString()
      }
      if (row.metric_type === 'Patient Collections') {
  patientCollectionsFormatted[key] =
    `$${Number(row.metric_value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
}

if (row.metric_type === 'Insurance Collections') {
  insuranceCollectionsFormatted[key] =
    `$${Number(row.metric_value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
}
    })

    setProductionData(productionFormatted)
    setCollectionsData(collectionsFormatted)
    setStartsData(startsFormatted)
    setPatientCollectionsData(patientCollectionsFormatted)
    setInsuranceCollectionsData(insuranceCollectionsFormatted)
  }

  fetchData()
}, [])


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
  {isAdmin() && (
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
  )}
</div>

</div>
<div style={topRowGrid}>
<div style={sectionBlock}>
  <div style={sectionTitle}>
    Production
 
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
  value={productionData[`${month}-${year}`] || ''}
  onChange={(e) => {
    setProductionData({
      ...productionData,
      [`${month}-${year}`]: e.target.value
    })
  }}
  onBlur={(e) => {
    const formatted = formatCurrency(e.target.value)

    setProductionData({
      ...productionData,
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

      <div style={sectionBlock}>
  <div style={sectionTitle}>
    Collections

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
  value={collectionsData[`${month}-${year}`] || ''}
  onChange={(e) => {
    setCollectionsData({
      ...collectionsData,
      [`${month}-${year}`]: e.target.value
    })
  }}
  onBlur={(e) => {
    const formatted = formatCurrency(e.target.value)

    setCollectionsData({
      ...collectionsData,
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
</div>

<div style={topRowGrid}>
<div style={startsWrapper}></div>
    <div style={sectionBlock}>
  <div style={sectionTitle}>
    Starts
 
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
  readOnly={!isEditing}
  value={startsData[`${month}-${year}`] || ''}
  onChange={(e) => {
    setStartsData({
      ...startsData,
      [`${month}-${year}`]: e.target.value
    })
  }}
  onBlur={(e) => {
    const cleanedValue = e.target.value.replace(/,/g, '')

    setStartsData({
      ...startsData,
      [`${month}-${year}`]: Number(cleanedValue).toLocaleString()
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
    </div>
    <div style={startsWrapper}>
  <div style={sectionBlock}>
    <div style={sectionTitle}>
      Patient Collections
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
                    value={patientCollectionsData[`${month}-${year}`] || ''}
                    onChange={(e) => {
                      setPatientCollectionsData({
                        ...patientCollectionsData,
                        [`${month}-${year}`]: e.target.value
                      })
                    }}
                    onBlur={(e) => {
                      const formatted = formatCurrency(e.target.value)

                      setPatientCollectionsData({
                        ...patientCollectionsData,
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
</div>


<div style={startsWrapper}>
  <div style={sectionBlock}>
    <div style={sectionTitle}>
      Insurance Collections
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
                    value={insuranceCollectionsData[`${month}-${year}`] || ''}
                    onChange={(e) => {
                      setInsuranceCollectionsData({
                        ...insuranceCollectionsData,
                        [`${month}-${year}`]: e.target.value
                      })
                    }}
                    onBlur={(e) => {
                      const formatted = formatCurrency(e.target.value)

                      setInsuranceCollectionsData({
                        ...insuranceCollectionsData,
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
</div>
    </div>
  )
}



const container: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: COLORS.grayAppBackground
}

const header: React.CSSProperties = {
  padding: 24
}

const title: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 800,
  color: COLORS.navy
}

const subtitle: React.CSSProperties = {
  color: COLORS.textMuted,
  marginTop: 8
}

const tableWrapper: React.CSSProperties = {
  padding: 20,
  overflowX: 'auto'
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: COLORS.white,
  borderRadius: 12
}

const th: React.CSSProperties = {
  padding: 14,
  border: `1px solid ${COLORS.orangeSoft}`,
  backgroundColor: COLORS.orangePrimary,
  color: COLORS.white,
  fontWeight: 700,
  textAlign: 'center'
}

const td: React.CSSProperties = {
  padding: 10,
  border: `1px solid ${COLORS.orangeSoft}`,
  textAlign: 'center'
}

const monthCell: React.CSSProperties = {
  padding: 12,
  border: `1px solid ${COLORS.orangeSoft}`,
  fontWeight: 700,
  color: COLORS.navy,
  backgroundColor: COLORS.orangeTint
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 10,
  border: `1px solid ${COLORS.orangeSoft}`,
  borderRadius: 8,
  textAlign: 'center',
  color: COLORS.textPrimary,
  backgroundColor: COLORS.white
}

const headerBar: React.CSSProperties = {
  backgroundColor: COLORS.orangePrimary,
  padding: 24,
  margin: 20,
  borderRadius: 14,
  border: `2px solid ${COLORS.orangeSoft}`,
  boxShadow: COLORS.shadowSoft,
  position: 'sticky',
  top: 0,
  zIndex: 100,
  marginBottom: 24
}

const headerTitle: React.CSSProperties = {
  fontSize: 40,
  fontWeight: 800,
  color: COLORS.white,
  marginBottom: 6
}

const headerSubtitle: React.CSSProperties = {
  color: COLORS.white,
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
  color: COLORS.navy
}

const actionRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: 18
}

const editButton: React.CSSProperties = {
  backgroundColor: COLORS.navy,
  color: COLORS.white,
  border: 'none',
  padding: '12px 22px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  minWidth: 110
}

const sectionTableCard: React.CSSProperties = {
  margin: '0 0 32px 0',
  backgroundColor: COLORS.grayPanel,
  border: `2px solid ${COLORS.orangeSoft}`,
  borderRadius: 16,
  padding: 20,
  boxShadow: COLORS.shadowSoft
}

const topRowGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 24,
  margin: '0 20px 32px 20px',
  alignItems: 'start'
}

const sectionBlock: React.CSSProperties = {
  backgroundColor: COLORS.grayPanel,
  border: `2px solid ${COLORS.orangeSoft}`,
  borderRadius: 16,
  padding: 20,
  boxShadow: COLORS.shadowSoft
}

const startsWrapper: React.CSSProperties = {
  width: '100%'
}

const middleRowGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 24,
  margin: '0 20px 32px 20px',
  alignItems: 'start'
}