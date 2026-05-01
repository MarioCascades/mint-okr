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

  <button
    style={backButton}
    onClick={() => router.push('/')}
  >
    ← Back to Main
  </button>
  <button
  style={editButton}
  onClick={() => setIsEditing(!isEditing)}
>
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

       <Objective title="Objective 4: Office Efficiency">

<KeyResult
  label="Call Answer Rate"
  selectedMonth={selectedMonth}
  isEditing={false}
  isPercent={true}
  sourceUser="Ashley"
  note="(Pulls from Ashley)"
/>

<KeyResult
  label="# of Missed Calls"
  selectedMonth={selectedMonth}
  isEditing={false}
  sourceUser="Ashley"
  note="(Pulls from Ashley)"
/>

<KeyResult
  label="# of Patients Waited 10+ Minutes"
  selectedMonth={selectedMonth}
  isEditing={false}
  sourceUser="Mari"
  note="(Pulls from Mari)"
/>

<KeyResult
  label="FD # of tasks in Lead Sigma"
  selectedMonth={selectedMonth}
  isEditing={false}
  sourceUser="Ashley"
  note="(Pulls from Ashley)"
/>

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
  "FD # of tasks in Lead Sigma": "Tasks in Lead Sigma",
  "Call Answer Rate": "Call Answer Rate",
  "# of Missed Calls": "# of Missed Calls",
  "# of Patients Waited 10+ Minutes": "Patients Waited 10+ Minutes",
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

const computedTargets: Record<string, (prev: number) => number> = {
  "FD Amount Due": (prev) => prev * 0.9,
  "FD Obs Overdue 30+": (prev) => prev * 0.9,
}

const KeyResult = ({ label, selectedMonth, isEditing, isCurrency = false, isPercent = false, sourceUser, note }: any) => {

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [target, setTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const [showInitiatives, setShowInitiatives] = useState(false)
  const [initiatives, setInitiatives] = useState([
  '',
  '',
  ''
])

const getScoreStyle = () => {
  const num = Number(score.replace('%', ''))

  if (isNaN(num)) return { backgroundColor: '#FFFFFF' }

  if (num >= 100) return { backgroundColor: '#acf3c3d7' }
  if (num >= 90) return { backgroundColor: '#fff4ccf3' }
  return { backgroundColor: '#f3b8b8d8' }
}

  useEffect(() => {

    const fetchData = async () => {

      const { data: base } = await supabase
        .from('dashboard_okr_data')
        .select('*')
        .eq('user_name', sourceUser || 'Alli')  
       .eq('key_result_title', label)
        .maybeSingle()

      if (!base) return

      setKeyResultId(base.key_result_id)
      const initiativeDate = `${selectedMonth.getFullYear()}-${String(
  selectedMonth.getMonth() + 1
).padStart(2, '0')}-01`
const currentStart = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth(),
  1
)

const nextMonth = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth() + 1,
  1
)



const { data: currentInitiatives } = await supabase
  .from('initiatives')
  .select('initiative_index, text')
  .eq('key_result_id', base.key_result_id)
  .gte('reporting_month', currentStart.toISOString())
  .lt('reporting_month', nextMonth.toISOString())
  .order('initiative_index', { ascending: true })
  
let loaded = ['', '', '']

// STEP A — current month initiatives
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
  // STEP B — fallback to latest previous initiatives
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

     const formatDate = (d: Date) =>
       `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

const currentDate = formatDate(selectedMonth)

const { data: currentData } = await supabase
  .from('key_result_updates')
  .select('value, target_value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', currentDate)
  .maybeSingle()


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

const { data: prevDataForTarget } = await supabase
  .from('key_result_updates')
  .select('value')
  .eq('key_result_id', base.key_result_id)
  .gte('reporting_month', prevStart.toISOString())
  .lt('reporting_month', prevEnd.toISOString())
  .maybeSingle()

const prevValue = Number(prevDataForTarget?.value ?? 0)

let t = 0

if (computedTargets[label]) {
  t = computedTargets[label](prevValue)
} else {
  if (
    currentData &&
    currentData.target_value !== null &&
    currentData.target_value !== undefined
  ) {
    t = Number(currentData.target_value)
  } else {
    const { data: prevTarget } = await supabase
      .from('key_result_updates')
      .select('target_value')
      .eq('key_result_id', base.key_result_id)
      .lt('reporting_month', currentDate)
      .not('target_value', 'is', null)
      .order('reporting_month', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (
      prevTarget?.target_value !== null &&
      prevTarget?.target_value !== undefined
    ) {
      t = Number(prevTarget.target_value)
    } else {
      t = Number(base.target_value ?? 0)
    }
  }
}

const c =
  currentData?.value !== null &&
  currentData?.value !== undefined
    ? Number(currentData.value)
    : 0

setTarget(
  // ✅ Amount Due → currency formatting
  label === "FD Amount Due"
    ? formatCurrency(t)

    // ✅ Obs Overdue → rounded whole number
    : label === "FD Obs Overdue 30+"
    ? Math.round(t).toString()

    // ✅ everything else (unchanged)
    : isCurrency
    ? formatCurrency(t)
    : isPercent
    ? t + '%'
    : t.toString()
)

setValue(
  isCurrency
    ? formatCurrency(c)
    : isPercent
    ? (c * 100).toFixed(2) + '%'
    : c.toString()
)




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
      setLastMonth(
  isCurrency
    ? formatCurrency(prevVal)
    : isPercent
    ? (prevVal * 100).toFixed(2) + '%'
    : prevVal.toString()
)

      if (isPercent) {
  setScore(c + '%')
} else if (t > 0) {
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
const handleInitiativeSave = async (
  index: number,
  text: string
) => {
  if (!keyResultId) return
  const reportingDate = `${selectedMonth.getFullYear()}-${String(
    selectedMonth.getMonth() + 1
  ).padStart(2, '0')}-01`

  const { data, error } = await supabase
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

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row}>
       <span>
  {labelMap[label] || label}
  {note && (
    <span style={{ fontSize: 13, color: '#6B7280', marginLeft: 6, fontStyle: 'italic', opacity: 0.9 }}>
      ({note})
    </span>
  )}
</span>

        <input style={prevCell} value={lastMonth} readOnly />
       
  {/* TARGET */}
<input
  style={targetCell}
  value={isEditing ? target.replace(/[^0-9.]/g, '') : target}
  disabled={!isEditing}
  onChange={(e) => setTarget(e.target.value)}
  onBlur={handleSave}
/>

{/* VALUE */}
<input
  style={currentCell}
  value={isEditing ? value.replace(/[^0-9.]/g, '') : value}
  disabled={!isEditing}
  onChange={(e) => setValue(e.target.value)}
  onBlur={handleSave}
/>
 <input
  style={{
    ...scoreCellBase,
    ...getScoreStyle()
  }}
  value={score}
  readOnly
/>

        <button
  style={button}
  onClick={() => setShowInitiatives(!showInitiatives)}
>
  {showInitiatives ? 'Hide' : '+ Initiatives'}
</button>
      </div>
      {showInitiatives && (
  <div style={initiativeRow}>
    {initiatives.map((item, index) => (
      <input
        key={index}
        style={cell}
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
const prevCell: React.CSSProperties = {
  ...cell,
  backgroundColor: '#cacacada'
}

const targetCell: React.CSSProperties = {
  ...cell,
  backgroundColor: '#9c9dfd'
}

const currentCell: React.CSSProperties = {
  ...cell,
  backgroundColor: '#FFFFFF'
}

const scoreCellBase: React.CSSProperties = {
  ...cell,
  fontWeight: 600
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