'use client'


import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
  label: string
  user?: string
  value?: number
  prev?: number
  target?: number
  isCurrency?: boolean
  isPercent?: boolean

  initiatives?: string[]
  setInitiatives?: (vals: string[]) => void
  saveInitiative?: (
    metricName: string,
    initiativeNumber: number,
    content: string
  ) => Promise<void>
}
export default function KPI({
  label,
  user,
  value,
  prev,
  target,
  isCurrency,
  isPercent,
  initiatives = ['', '', ''],
  setInitiatives,
  saveInitiative
}: Props) {

  const [data, setData] = useState<any[]>([])
  const [showInit, setShowInit] = useState(false)

  // =========================
  // KPI CONFIG (YOUR SYSTEM)
  // =========================

 const config: any = {
  'Total TC Starts': {
    type: 'combined',
    db: ['Total TC Starts']
  },

  'Total Production': {
    type: 'combined',
    db: ['TC Total Production after Discounts']
  },

  'Consults Kept': {
    type: 'combined',
    db: ['Kept New Patients']
  },

  'Macro Conversion Rate': {
    type: 'calculated'
  }
}
  useEffect(() => {
    if (label !== 'Macro Conversion Rate') {
      fetchData()
    }
  }, [user, label])

  const fetchData = async () => {

    const cfg = config[label]
    if (!cfg) return

    const { data, error } = await supabase
      .from('dashboard_okr_data')
      .select('*')
      .in('key_result_title', cfg.db)

    if (error) {
      console.error('Fetch error:', error)
    } else {
      setData(data || [])
    }
  }

  // =========================
  // VALUE CALCULATIONS
  // =========================

  const getTotals = () => {
    if (!data || data.length === 0) {
      return {
        lastMonth: 0,
        target: 0,
        current: 0
      }
    }

    const filtered =
      config[label]?.type === 'combined'
        ? data.filter(d =>
            d.user_name === 'Jordyn' || d.user_name === 'Olivia'
          )
        : data.filter(d => d.user_name === user)

    return {
      lastMonth: filtered.reduce((sum, d) => sum + (d.last_month_value || 0), 0),
      target: filtered.reduce((sum, d) => sum + (d.target_value || 0), 0),
      current: filtered.reduce((sum, d) => sum + (d.current_value || 0), 0)
    }
  }

  const totals = getTotals()

  const finalPrev = prev ?? totals.lastMonth
  const finalTarget = target ?? totals.target
  const finalCurrent = value ?? totals.current

  // =========================
  // MACRO CALCULATION
  // =========================

  const [macro, setMacro] = useState(0)

  useEffect(() => {
    if (label === 'Macro Conversion Rate') {
      calculateMacro()
    }
  }, [user])

  const calculateMacro = async () => {

    const { data, error } = await supabase
      .from('dashboard_okr_data')
      .select('*')
      .in('key_result_title', ['Total TC Starts', 'Kept New Patients'])

    if (error) return

    const starts = data
      .filter(d => d.key_result_title === 'Total TC Starts')
      .reduce((sum, d) => sum + (d.current_value || 0), 0)

    const consults = data
      .filter(d => d.key_result_title === 'Kept New Patients')
      .reduce((sum, d) => sum + (d.current_value || 0), 0)

    setMacro(consults ? starts / consults : 0)
  }

  const percent =
  finalTarget > 0
    ? finalCurrent / finalTarget
    : 0
  const getResultBackground = () => {
  const score = percent * 100

  if (score >= 100) {
    return '#acf3c3d7' // light green
  }

  if (score >= 90) {
    return '#fff4ccf3' // soft yellow
  }

  return '#f3b8b8d8' // light red
}
  // =========================
  // UPDATE LOGIC (ONLY SINGLE)
  // =========================

  const updateValue = async (value: number) => {
    const cfg = config[label]

    if (!cfg || cfg.type !== 'single') return
    if (!data || data.length === 0) return

    const record = data.find(d => d.user_name === user)

    if (!record) return

    const { error } = await supabase
      .from('key_result_updates')
      .insert({
        key_result_id: record.key_result_id,
        current_value: value
      })

    if (error) {
      console.error('Update error:', error)
    } else {
      fetchData()
    }
  }

  // =========================
  // UI
  // =========================

  return (
    <div style={kpiCard}>

      <div style={kpiLabel}>{label}</div>

      <div style={kpiHeader}>
        <span>Prev</span>
        <span>Target</span>
        <span>Current</span>
        <span>Result</span>
      </div>

      <div style={kpiRow}>

        <input
  style={prevCell}
  value={
    isCurrency
      ? `$${Number(finalPrev).toLocaleString()}`
      : isPercent
      ? `${Math.round(finalPrev)}%`
      : finalPrev || ''
  }
  readOnly
/>

<input
  style={targetCell}
  value={
    isCurrency
      ? `$${Number(finalTarget).toLocaleString()}`
      : isPercent
      ? `${Math.round(finalTarget)}%`
      : finalTarget || ''
  }
  readOnly
/>

<input
  style={currentCell}
  value={
    isCurrency
      ? `$${Number(finalCurrent).toLocaleString()}`
      : isPercent
      ? `${Math.round(finalCurrent)}%`
      : finalCurrent || ''
  }
  onChange={() => {}}
  onBlur={(e) => updateValue(Number(e.target.value))}
  disabled={config[label]?.type !== 'single'}
/>

<input
  style={{
    ...cell,
    backgroundColor: getResultBackground(),
    fontWeight: 800,
    fontSize: 16,
    color: '#1E266D'
  }}
  value={percent ? `${Math.round(percent * 100)}%` : ''}
  disabled
/>
      </div>

      <button style={button} onClick={() => setShowInit(!showInit)}>
        {showInit ? 'Hide' : '+ Initiatives'}
      </button>

      {showInit && (
  <div style={initRow}>
    {[0, 1, 2].map((index) => (
      <input
        key={index}
        style={cellWide}
        placeholder={`Initiative ${index + 1}`}
        value={initiatives[index] || ''}
        onChange={(e) => {
          if (!setInitiatives) return

          const updated = [...initiatives]
          updated[index] = e.target.value

          setInitiatives(updated)
        }}
        onBlur={(e) => {
          if (!saveInitiative) return

          saveInitiative(
            label,
            index + 1,
            e.target.value
          )
        }}
      />
    ))}
  </div>
)}

    </div>
  )
}

//
// ================= STYLES =================
//

const KPI_COLORS = {
  navy: '#1E266D',
  blue: '#A9C9D8',
  orange: '#F26C2F',
  peach: '#F6A27A',
  white: '#FFFFFF',
  border: '#D9DEE8',
  lightGray: '#F7F8FA',
  text: '#1F2937',
  muted: '#6B7280'
}

const kpiCard: React.CSSProperties = {
  backgroundColor: '#E5E5E5',
  border: '2px solid #F6A27A',
  borderRadius: 18,
  padding: 24,
  boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
  overflow: 'hidden'
}

const kpiLabel: React.CSSProperties = {
  color: '#1E266D',
  fontSize: 24,
  fontWeight: 800,
  marginBottom: 16,
  paddingBottom: 10,
  borderBottom: '2px solid #F6A27A',
  textAlign: 'center'
}
const kpiHeader: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 8,
  fontSize: 13,
  fontWeight: 700,
  color: KPI_COLORS.muted,
  marginBottom: 10,
  textAlign: 'center'
}

const kpiRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 8
}

const cell: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#FFFFFF',
  border: '1px solid #F6A27A',
  borderRadius: 8,
  color: '#1E266D',
  fontSize: 14,
  fontWeight: 500,
  textAlign: 'center',
  outline: 'none'
}
const prevCell: React.CSSProperties = {
  ...cell,
  backgroundColor: '#cacacada'
}

const targetCell: React.CSSProperties = {
  ...cell,
  backgroundColor: '#a3a4da'
}

const currentCell: React.CSSProperties = {
  ...cell,
  backgroundColor: '#FFFFFF'
}

const cellWide: React.CSSProperties = {
  ...cell,
  textAlign: 'left'
}

const button: React.CSSProperties = {
  marginTop: 14,
  width: '100%',
  backgroundColor: KPI_COLORS.orange,
  border: 'none',
  padding: '10px 12px',
  borderRadius: 8,
  cursor: 'pointer',
  color: KPI_COLORS.white,
  fontSize: 13,
  fontWeight: 600
}

const initRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 10,
  marginTop: 10,
  padding: 12,
  backgroundColor: '#FFF7F3',
  borderRadius: 12,
  border: '1px solid #F6A27A'
}