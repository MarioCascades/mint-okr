'use client'
export const dynamic = 'force-dynamic'

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
}

export default function KPI({ label, user, value, prev, target, isCurrency, isPercent }: Props) {

  const [data, setData] = useState<any[]>([])
  const [showInit, setShowInit] = useState(false)

  // =========================
  // KPI CONFIG (YOUR SYSTEM)
  // =========================

  const config: any = {
    'Total Starts': {
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
  style={cell}
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
  style={cell}
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
  style={cell}
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
          style={cell}
          value={percent ? `${Math.round(percent * 100)}%` : ''}
          disabled
        />

      </div>

      <button style={button} onClick={() => setShowInit(!showInit)}>
        {showInit ? 'Hide' : '+ Initiatives'}
      </button>

      {showInit && (
        <div style={initRow}>
          <input style={cellWide} placeholder="Initiative 1" />
          <input style={cellWide} placeholder="Initiative 2" />
          <input style={cellWide} placeholder="Initiative 3" />
        </div>
      )}

    </div>
  )
}

//
// ================= STYLES =================
//

const kpiCard : React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  padding: 10,
  borderRadius: 6
}

const kpiLabel : React.CSSProperties = {
  textAlign: 'center',
  marginBottom: 10,
  fontWeight: 600
}

const kpiHeader : React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 12,
  marginBottom: 5
}

const kpiRow : React.CSSProperties = {
  display: 'flex',
  gap: 5
}

const cell : React.CSSProperties = {
  width: '100%',
  padding: 4,
  backgroundColor: '#111',
  color: '#fff',
  border: '1px solid #333'
}

const cellWide : React.CSSProperties = {
  ...cell
}

const button : React.CSSProperties = {
  marginTop: 10,
  width: '100%',
  backgroundColor: '#00AEEF',
  border: 'none',
  padding: '4px 8px',
  borderRadius: 6,
  cursor: 'pointer',
  color: '#000',
  fontSize: 12
}

const initRow : React.CSSProperties = {
  display: 'flex',
  gap: 5,
  marginTop: 10
}