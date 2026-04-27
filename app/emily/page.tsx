'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { supabase } from '../../lib/supabase'

export default function Page() {

  const router = useRouter()

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [lastUpdated, setLastUpdated] = useState('')
  const [percentIntoPeriod, setPercentIntoPeriod] = useState('')
  const [isEditing, setIsEditing] = useState(false)


  useEffect(() => {
    const today = new Date()
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const endOfMonth = new Date(year, month + 1, 0)

    let percent = 0

    if (today.getFullYear() === year && today.getMonth() === month) {
      percent = (today.getDate() / endOfMonth.getDate()) * 100
    } else if (today > endOfMonth) {
      percent = 100
    }

    setPercentIntoPeriod(Math.round(percent) + '%')
  }, [selectedMonth])

  useEffect(() => {
  const fetchLastUpdated = async () => {
    const { data } = await supabase
      .from('key_result_updates')
      .select('last_updated_at')
      .order('last_updated_at', { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
      const formatted = new Date(data[0].last_updated_at).toLocaleString()
      setLastUpdated(formatted)
    }
  }

  fetchLastUpdated()
}, [])

  const formatMonth = (date: Date) =>
    date.toLocaleString('default', { month: 'short', year: 'numeric' })

  const changeMonth = (offset: number) => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + offset)
      return newDate
    })
  }

  const isFutureMonth = () => {
    const now = new Date()
    return selectedMonth > new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return (
    <div style={container}>
      <TopNav />

      <div style={stickyHeader}>
        <h1 style={title}>Emily - Office Manager</h1>

        <p style={description}>
          Responsible for overseeing daily office operations, supporting both administrative and clinical teams, and driving consistency, accountability, and team performance across the entire practice.
        </p>

        <div style={topSection}>
          <div style={leftMeta}>
            <div style={metaItem}>
              <label style={label}>Date Updated</label>
              <div style={inputSmall}>{lastUpdated || '—'}</div>
              <input type="text" placeholder="10 State" style={inputSmall} />
            </div>

           <div style={metaItem}>
  <label style={label}>% Into Period</label>
  <input style={inputSmall} value={percentIntoPeriod} readOnly />
</div>

<div style={metaItem}>
  <label style={label}>OKR Time Frame</label>

  <div style={monthSelector}>
    <button
      style={arrowButton}
      onClick={() => changeMonth(-1)}
    >
      ←
    </button>

    <span style={monthText}>
      {formatMonth(selectedMonth)}
    </span>

    <button
      style={{
        ...arrowButton,
        opacity: isFutureMonth() ? 0.3 : 1
      }}
      disabled={isFutureMonth()}
      onClick={() => changeMonth(1)}
    >
      →
    </button>
  </div>
</div>
          </div>

          <div style={rightMeta}>

            {/*BACK BUTTON */}
            <button
              style={backButton}
              onClick={() => router.push('/')}
            >
              ← Back to Main
            </button>

                        <button style={editButton} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      <div style={content}>
        <Objective title="Objective 1: Mentoring & Training the Admin & TC Teams">
          <KeyResult label="Monthly 1:1 with Team" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 2: Whole Office HR Support">
          <KeyResult label="eNPS Results" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Monthly Pulse Survey Result" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Response Rate" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 3: Team Consistency Metrics">
          <KeyResult label="No. of Late Arrivals (8:00 or later)" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="# of Same Day Call Outs" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>
      </div>
    </div>
  )
}

// =========================
// OBJECTIVE
// =========================

const Objective = ({ title, children }: any) => (
  <div style={objective}>
    <h2 style={objectiveTitle}>{title}</h2>

    <div style={headerRow}>
      <span>Key Results</span>
      <span>Last Month</span>
      <span>Target</span>
      <span>This Month</span>
      <span>Score</span>
      <span></span>
    </div>

    {children}
  </div>
)

// =========================
// KEY RESULT
// =========================
const KeyResult = ({ label, selectedMonth, isEditing }: any) => {

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [target, setTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const [metricType, setMetricType] = useState('')
  const [showInitiatives, setShowInitiatives] = useState(false)
  const [initiatives, setInitiatives] = useState([
  '',
  '',
  ''
])

  const isPercentage = metricType === 'percentage'

  const handleEnter = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const inputs = Array.from(document.querySelectorAll('input'))
      const index = inputs.indexOf(e.target)
      if (index > -1 && index < inputs.length - 1) {
        (inputs[index + 1] as HTMLElement).focus()
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {

      const { data: base } = await supabase
        .from('dashboard_okr_data')
        .select('*')
        .eq('user_name', 'Emily')
        .eq('key_result_title', label)
        .maybeSingle()

      if (!base) return

      setKeyResultId(base.key_result_id)
      const initiativeDate = `${selectedMonth.getFullYear()}-${String(
  selectedMonth.getMonth() + 1
).padStart(2, '0')}-01`

const { data: currentInitiatives } = await supabase
  .from('initiatives')
  .select('initiative_index, text')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', initiativeDate)
  .order('initiative_index', { ascending: true })

let loaded = ['', '', '']

// Current month initiatives
if (currentInitiatives && currentInitiatives.length > 0) {
  currentInitiatives.forEach((row) => {
    if (
      row.initiative_index >= 1 &&
      row.initiative_index <= 3
    ) {
      loaded[row.initiative_index - 1] = row.text || ''
    }
  })
} else {
  // fallback to latest previous month
  const { data: previousInitiatives } = await supabase
    .from('initiatives')
    .select('initiative_index, text, reporting_month')
    .eq('key_result_id', base.key_result_id)
    .lt('reporting_month', initiativeDate)
    .order('reporting_month', { ascending: false })
    .order('initiative_index', { ascending: true })

  if (previousInitiatives && previousInitiatives.length > 0) {
    const latestMonth =
      previousInitiatives[0].reporting_month

    previousInitiatives
      .filter((row) => row.reporting_month === latestMonth)
      .forEach((row) => {
        if (
          row.initiative_index >= 1 &&
          row.initiative_index <= 3
        ) {
          loaded[row.initiative_index - 1] =
            row.text || ''
        }
      })
  }
}

setInitiatives(loaded)

      const { data: kr } = await supabase
        .from('key_results')
        .select('target_value, metric_type')
        .eq('id', base.key_result_id)
        .maybeSingle()

      setMetricType(kr?.metric_type ?? '')

      const formatDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

      const currentDate = formatDate(selectedMonth)

      const prev = new Date(selectedMonth)
      prev.setMonth(prev.getMonth() - 1)
      const prevDate = formatDate(prev)

      const { data: currentRow } = await supabase
        .from('key_result_updates')
        .select('value, target_value')
        .eq('key_result_id', base.key_result_id)
        .eq('reporting_month', currentDate)
        .maybeSingle()


      const { data: prevRow } = await supabase
        .from('key_result_updates')
        .select('value, target_value')
        .eq('key_result_id', base.key_result_id)
        .eq('reporting_month', prevDate)
        .maybeSingle()

        console.log('CURRENT ROW:', currentRow)
        console.log('PREV ROW:', prevRow)


      const currentValue = currentRow?.value ?? base.current_value ?? ''
      setValue(currentValue)
      setLastMonth(prevRow?.value ?? '')

   const resolvedTarget = currentRow?.target_value ?? prevRow?.target_value ?? null

setTarget(
  resolvedTarget !== null ? String(resolvedTarget) : ''
)
//  Persist carry-forward target into DB
if (
  currentRow?.target_value == null &&
  prevRow?.target_value != null
) {
  await supabase.from('key_result_updates').upsert(
    {
      key_result_id: base.key_result_id,
      reporting_month: currentDate,
      target_value: prevRow.target_value,
    },
    { onConflict: 'key_result_id,reporting_month' }
  )
}
      const c = Number(currentValue)
      const t = Number(resolvedTarget ?? target)

      if (t > 0) {
        setScore(Math.round((c / t) * 100) + '%')
      } else {
        setScore('')
      }
    }

    fetchData()

  }, [label, selectedMonth])

  const handleSave = async () => {
    if (!keyResultId) return

    const y = selectedMonth.getFullYear()
    const m = String(selectedMonth.getMonth() + 1).padStart(2, '0')
    const reportingDate = `${y}-${m}-01`

    await supabase.from('key_result_updates').upsert(
      {
        key_result_id: keyResultId,
        reporting_month: reportingDate,
        value: value === '' ? null : Number(value),
        target_value: target === '' ? null : Number(target),
      },
      { onConflict: 'key_result_id,reporting_month' }
    )
  }
  const handleInitiativeSave = async (
  index: number,
  text: string
) => {
  if (!keyResultId) return

  const reportingDate = `${selectedMonth.getFullYear()}-${String(
    selectedMonth.getMonth() + 1
  ).padStart(2, '0')}-01`

  await supabase
    .from('initiatives')
    .upsert(
      {
        key_result_id: keyResultId,
        reporting_month: reportingDate,
        initiative_index: index + 1,
        text
      },
      {
        onConflict:
          'key_result_id,reporting_month,initiative_index'
      }
    )
}

  const isLowerBetter = (label: string) => {
    const l = label.toLowerCase()
    return l.includes('late arrivals') || l.includes('call outs')
  }

  const getScoreColor = () => {
    const num = Number(score.replace('%', ''))
    if (!num) return '#9CA3AF'
    return isLowerBetter(label)
      ? num <= 100 ? '#22c55e' : '#c2410c'
      : num >= 100 ? '#22c55e' : '#c2410c'
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row}>
        <span>{label}</span>

        <input style={cell} value={lastMonth} readOnly />

        <input
  style={cell}
  value={
  isEditing
    ? target
    : isPercentage && target
    ? target + '%'
    : target
}
  disabled={!isEditing}
  onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ''))}
  onBlur={handleSave}
        />

        <input
          style={cell}
          value={
  isEditing
    ? value
    : isPercentage && value
    ? value + '%'
    : value
}
          disabled={!isEditing}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ''))}
          onBlur={handleSave}
          onKeyDown={handleEnter}
        />

        <input style={{ ...cell, color: getScoreColor() }} value={score} readOnly />

        <button style={button} onClick={() => setShowInitiatives(!showInitiatives)}>
  {showInitiatives ? 'Hide' : '+ Initiatives'}
</button>
      </div>

      {showInitiatives && (
        <div style={initiativeRow}>
          {initiatives.map((item, index) => (
            <input
              key={index}
           style={{  ...cell,
            minHeight: 42,
            padding: '8px 10px'
          }}
              placeholder={`Initiative ${index + 1}`}
              value={item}
              disabled={!isEditing}
              onChange={(e) => {
                const updated = [...initiatives]
                updated[index] = e.target.value
                setInitiatives(updated)
              }}
              onBlur={() =>
                handleInitiativeSave(
                  index,
                  initiatives[index]
                )
              }
            />
          ))}
        </div>
      )}

    </div>
  )
}

// =========================
// STYLES
// =========================

const container: React.CSSProperties = {
  backgroundColor: '#ecececd5',
  minHeight: '100vh',
  color: '#1E266D'
}

const stickyHeader: React.CSSProperties = {
  position: 'sticky',
  top: 60,
  zIndex: 10,
  background: 'linear-gradient(90deg, #F26C2F 0%, #F58220 100%)',
  padding: 24,
  borderBottom: '1px solid #F6A27A',
  borderRadius: 16,
  margin: 16,
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
}

const content: React.CSSProperties = {
  padding: 20,
  overflowX: 'auto'
}

const title: React.CSSProperties = {
  fontSize: 38,
  fontWeight: 700,
  color: '#FFFFFF',
  marginBottom: 8
}

const description: React.CSSProperties = {
  fontSize: 16,
  color: '#FFFFFF',
  marginBottom: 24,
  maxWidth: 900,
  lineHeight: 1.5
}

const topSection: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 24,
  alignItems: 'flex-start'
}

const leftMeta: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: 16,
  flexWrap: 'wrap',
  alignItems: 'flex-end'
}

const rightMeta: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  alignItems: 'stretch',
  minWidth: 220
}

const metaItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 220
}

const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#FFFFFF',
  marginBottom: 6
}

const inputSmall: React.CSSProperties = {
  height: 44,
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #F6A27A',
  backgroundColor: '#FFFFFF',
  color: '#1E266D',
  fontSize: 15,
  fontWeight: 500
}

const monthSelector: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 8,
  borderRadius: 12,
  backgroundColor: '#F6A27A'
}

const arrowButton: React.CSSProperties = {
  backgroundColor: '#1E266D',
  border: 'none',
  padding: '10px 14px',
  borderRadius: 8,
  color: '#FFFFFF',
  cursor: 'pointer',
  fontWeight: 600
}

const editButton: React.CSSProperties = {
  backgroundColor: '#1E266D',
  border: 'none',
  padding: '12px 20px',
  borderRadius: 10,
  color: '#FFFFFF',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 15,
  width: '100%',
  height: 52
}

const backButton: React.CSSProperties = {
  backgroundColor: '#1E266D',
  border: 'none',
  padding: '12px 20px',
  borderRadius: 10,
  color: '#FFFFFF',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 15,
  width: '100%',
  height: 52
}

const monthText: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1E266D',
  minWidth: 120,
  textAlign: 'center'
}

const objective: React.CSSProperties = {
  marginBottom: 32,
  backgroundColor: '#FFFFFF',
  border: '2px solid #F6A27A',
  borderRadius: 18,
  padding: 24,
  boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
  overflow: 'hidden'
}

const objectiveTitle: React.CSSProperties = {
  color: '#1E266D',
  fontSize: 30,
  fontWeight: 800,
  marginBottom: 18,
  paddingBottom: 12,
  borderBottom: '2px solid #F6A27A'
}

const headerRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 10,
  marginBottom: 14,
  padding: '0 6px',
  fontWeight: 600,
  color: '#4B5563',
  fontSize: 14
}

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 10,
  marginBottom: 10,
  padding: 12,
  backgroundColor: '#FFFFFF',
  border: '1px solid #F6A27A',
  borderRadius: 12,
  alignItems: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
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

const button: React.CSSProperties = {
  backgroundColor: '#F26C2F',
  border: 'none',
  borderRadius: 8,
  padding: '10px 14px',
  cursor: 'pointer',
  color: '#FFFFFF',
  fontWeight: 600,
  fontSize: 13
}

const initiativeRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 10,
  marginTop: 10,
  padding: 12,
  backgroundColor: '#FFF7F3',
  borderRadius: 12,
  border: '1px solid #F6A27A'
}