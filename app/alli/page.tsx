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
        setLastUpdated(new Date(data[0].last_updated_at).toLocaleString())
      }
    }

    fetchLastUpdated()
  }, [])

  const formatMonth = (date: Date) =>
    date.toLocaleString('default', { month: 'short', year: 'numeric' })

  const changeMonth = (offset: number) => {
    setSelectedMonth(prev => {
      const d = new Date(prev)
      d.setMonth(prev.getMonth() + offset)
      return d
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
        <h1 style={title}>Alli - Patient Retention and Fincial Coordinator </h1>

        <p style={description}>
          Ensure timely patient collections, maintaining strong engagement with observation patients, and supporting overall practice efficiency through task management and follow-up systems. This role directly impacts cash flow, patient experience, and case conversion.
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
          </div>

          <div style={rightMeta}>

            <button style={backButton} onClick={() => router.push('/')}>
              ← Back to Main
            </button>

            <label style={label}>OKR Time Frame</label>

            <div style={monthSelector}>
              <button style={arrowButton} onClick={() => changeMonth(-1)}>←</button>
              <span style={monthText}>{formatMonth(selectedMonth)}</span>
              <button
                style={{ ...arrowButton, opacity: isFutureMonth() ? 0.3 : 1 }}
                disabled={isFutureMonth()}
                onClick={() => changeMonth(1)}
              >
                →
              </button>
            </div>

            <button style={editButton} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Save' : 'Edit'}
            </button>

          </div>
        </div>
      </div>

      <div style={content}>

        <Objective title="Objective 1: Collections">
          <KeyResult label="FD Overdue Patient Accounts" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="FD Amount Due" selectedMonth={selectedMonth} isEditing={isEditing} isCurrency />
          <KeyResult label="FD Write Offs ($)" selectedMonth={selectedMonth} isEditing={isEditing} isCurrency />
        </Objective>

        <Objective title="Objective 2: Observation Patients">
          <KeyResult label="FD Obs Due Next Month, This Month, and Last Month" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="FD Obs Overdue 30+" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="FD Obs No Show" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 3: Patient Engagement">
          <KeyResult label="FD Total Active Patients" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="FD Total Active Patients Needing Appointment" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 4: Tasks">
          <KeyResult label="FD # of tasks in Lead Sigma" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

      </div>
    </div>
  )
}

// =========================
// LABEL MAP
// =========================

const labelMap: Record<string, string> = {
  "FD Overdue Patient Accounts": "Overdue Patient Accounts",
  "FD Amount Due": "Amount Due",
  "FD Write Offs ($)": "Write Offs",
  "FD Obs Due Next Month, This Month, and Last Month": "Obs Due (Next / This / Last)",
  "FD Obs Overdue 30+": "Obs Overdue 30+",
  "FD Obs No Show": "Obs No Show",
  "FD Total Active Patients": "Active Patients",
  "FD Total Active Patients Needing Appointment": "Patients Needing Appointment",
  "FD # of tasks in Lead Sigma": "Tasks in Lead Sigma"
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

const formatCurrency = (val: number) =>
  `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const KeyResult = ({ label, selectedMonth, isEditing, isCurrency = false }: any) => {

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [target, setTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)

  useEffect(() => {

    const fetchData = async () => {

      const { data: base } = await supabase
        .from('dashboard_okr_data')
        .select('*')
        .eq('user_name', 'Alli')
        .eq('key_result_title', label)
        .maybeSingle()

      if (!base) return

      setKeyResultId(base.key_result_id)

     const formatDate = (d: Date) =>
       `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

const currentDate = formatDate(selectedMonth)

const { data: currentData } = await supabase
  .from('key_result_updates')
  .select('value, target_value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', currentDate)
  .maybeSingle()

const t =
  currentData?.target_value !== null &&
  currentData?.target_value !== undefined
    ? Number(currentData.target_value)
    : Number(base.target_value ?? 0)

const c =
  currentData?.value !== null &&
  currentData?.value !== undefined
    ? Number(currentData.value)
    : 0

      setTarget(isCurrency ? formatCurrency(t) : t.toString())
      setValue(isCurrency ? formatCurrency(c) : c.toString())

      const prev = new Date(selectedMonth)
      prev.setMonth(prev.getMonth() - 1)

const prevStart = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth() - 1,
  1
)

const prevEnd = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth(),
  1
)

const { data: prevData } = await supabase
  .from('key_result_updates')
  .select('value')
  .eq('key_result_id', base.key_result_id)
  .gte('reporting_month', prevStart.toISOString())
  .lt('reporting_month', prevEnd.toISOString())
  .maybeSingle()
     

      const prevVal = Number(prevData?.value ?? 0)
      setLastMonth(isCurrency ? formatCurrency(prevVal) : prevVal.toString())

      if (t > 0) {
        const percent = Math.round((c / t) * 100)
        setScore(percent + '%')
      } else {
        setScore('—')
      }
    }

    fetchData()

  }, [label, selectedMonth])

  const handleSave = async () => {

  if (!keyResultId) return

  const y = selectedMonth.getFullYear()
  const m = String(selectedMonth.getMonth() + 1).padStart(2, '0')
  const reportingDate = `${y}-${m}-01`

  const cleanValue = value.replace(/[^0-9.]/g, '')
  const cleanTarget = target.replace(/[^0-9.]/g, '')

  await supabase.from('key_result_updates').upsert(
  {
    key_result_id: keyResultId,
    reporting_month: reportingDate,
    value: cleanValue ? Number(cleanValue) : 0,
    target_value: cleanTarget ? Number(cleanTarget) : null,
  },
  { onConflict: 'key_result_id,reporting_month' }
)
  
}

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row}>
        <span>{labelMap[label] || label}</span>

        <input style={cell} value={lastMonth} readOnly />
       
  {/* TARGET */}
<input
  style={cell}
  value={isEditing ? target.replace(/[^0-9.]/g, '') : target}
  disabled={!isEditing}
  onChange={(e) => setTarget(e.target.value)}
  onBlur={handleSave}
/>

{/* VALUE */}
<input
  style={cell}
  value={isEditing ? value.replace(/[^0-9.]/g, '') : value}
  disabled={!isEditing}
  onChange={(e) => setValue(e.target.value)}
  onBlur={handleSave}
/>
        <input style={cell} value={score} readOnly />

        <button style={button}>+ Initiatives</button>
      </div>
    </div>
  )
}

// =========================
// STYLES
// =========================

const container : React.CSSProperties = { backgroundColor: '#000', minHeight: '100vh', color: '#fff' }

const stickyHeader : React.CSSProperties = {
  position: 'sticky',
  top: 60,
  zIndex: 10,
  backgroundColor: '#000',
  padding: 20,
  borderBottom: '1px solid #1F2937'
}

const content : React.CSSProperties = { 
  padding: 20,
  overflowX: 'auto'
}

const title : React.CSSProperties = { fontSize: 24, fontWeight: 700 }

const description : React.CSSProperties = {
  fontSize: 14,
  color: '#9CA3AF',
  marginBottom: 20,
  maxWidth: 800
}

const topSection : React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 20 }

const leftMeta : React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }
const rightMeta : React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }

const metaItem : React.CSSProperties = { display: 'flex', flexDirection: 'column' }

const label : React.CSSProperties = { fontSize: 12, color: '#9CA3AF' }

const inputSmall : React.CSSProperties = {
  height: 36,
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #1F2937',
  backgroundColor: '#0A0A0A',
  color: '#fff'
}

const monthSelector : React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 }

const arrowButton : React.CSSProperties = {
  backgroundColor: '#1F2937',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  color: '#fff'
}

const editButton : React.CSSProperties = {
  backgroundColor: '#00AEEF',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 6,
  color: '#000',
  fontWeight: 600,
  cursor: 'pointer'
}

const backButton : React.CSSProperties = {
  backgroundColor: '#1F2937',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 6,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12
}

const monthText : React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600
}

const objective : React.CSSProperties = { marginBottom: 40 }
const objectiveTitle = { color: '#00AEEF' }

const headerRow : React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 8,
  marginBottom: 10
}

const row : React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 8,
  marginBottom: 6
}

const cell : React.CSSProperties = {
  background: '#0A0A0A',
  border: '1px solid #1F2937',
  borderRadius: 6,
  color: '#fff'
}

const button : React.CSSProperties = {
  backgroundColor: '#00AEEF',
  border: 'none',
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
  color: '#000',
  fontSize: 12
}

const initiativeRow : React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 8
}

