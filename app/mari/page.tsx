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
        <h1 style={title}>Mari - Clinical Operations Manager</h1>

        <p style={description}>
          The clinical team’s primary support and resource, providing guidance, training, and oversight to drive consistency, accountability, and exceptional patient outcomes. In addition, efficiently manage digital workflows and clinical supply/inventory.
        </p>

       <div style={topSection}>

  <div style={leftMeta}>
    <div style={metaItem}>
      <label style={label}>Date Updated</label>
      <div style={inputSmall}>{lastUpdated || '—'}</div>
      <input
        type="text"
        placeholder="10 State"
        style={inputSmall}
      />
    </div>

    <div style={metaItem}>
      <label style={label}>% Into Period</label>
      <input
        style={inputSmall}
        value={percentIntoPeriod}
        readOnly
      />
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
        <Objective title="Objective 1: Ensure Patient Flow and Completion">
          <KeyResult label="# of Patients OVER ECD – LightForce" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="# of Patients OVER ECD – Aligners" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 2: Mentoring and Training the Clinical Team">
          <KeyResult label="Monthly 1:1 with Team" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="# of Patients Waited 10+ Minutes" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="# of TLC Appts Scheduled" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="# of Same Day Call Outs" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 3: Ensure Complete and On Time Case/Appliance Ordering and Delivery">
          <KeyResult label="# of Submissions Missed (OrthoFi Audit)" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult
  label="# of Submissions Missed (Scan Report)"
  selectedMonth={selectedMonth}
  isEditing={false}
  sourceUser="Ashlynn"
  sourceLabel="CO Orders Missing from Scan Report"
  note="Pulls from Ashlynn"
/>
          <KeyResult label="# of Patients Rescheduled due to delayed case" selectedMonth={selectedMonth} isEditing={isEditing} />
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

const KeyResult = ({
  label,
  selectedMonth,
  isEditing,
  sourceUser,
  sourceLabel,
  note
}: any) => {

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [target, setTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const [showInitiatives, setShowInitiatives] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [initiatives, setInitiatives] = useState([
  '',
  '',
  ''
])

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
      .eq('user_name', sourceUser || 'Mari')
      .eq('key_result_title', sourceLabel || label)
      .maybeSingle()

      if (!base) return

      console.log('SOURCE USER:', sourceUser)
console.log('SOURCE LABEL:', sourceLabel)
console.log('BASE RESULT:', base)

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

    // ------------------------
// FETCH CURRENT TARGET
// ------------------------

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

const currentDate = formatDate(selectedMonth)

const prev = new Date(selectedMonth)
prev.setMonth(prev.getMonth() - 1)
const prevDate = formatDate(prev)

const { data: prevData } = await supabase
        .from('key_result_updates')
        .select('value')
        .eq('key_result_id', base.key_result_id)
        .eq('reporting_month', formatDate(prev))
        .maybeSingle()


// CURRENT ROW
const { data: currentRow } = await supabase
  .from('key_result_updates')
  .select('value, target_value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', currentDate)
  .maybeSingle()

// PREVIOUS TARGET (carry forward)
const { data: prevRow } = await supabase
  .from('key_result_updates')
  .select('target_value')
  .eq('key_result_id', base.key_result_id)
  .lt('reporting_month', currentDate)
  .not('target_value', 'is', null)
  .order('reporting_month', { ascending: false })
  .limit(1)
  .maybeSingle()

// RESOLVE TARGET
let resolvedTarget =
  currentRow?.target_value ??
  prevRow?.target_value ??
  null

// FORCE COMPUTED TARGET FOR TLC APPTS
if (label === "# of TLC Appts Scheduled") {
  const prevValue =
    prevData?.value !== null && prevData?.value !== undefined
      ? Number(prevData.value)
      : 0

  resolvedTarget = Math.round(prevValue * 0.9)
}

// AUTO CREATE ROW FOR MONTH (carry forward target)
if (!currentRow && resolvedTarget !== '') {
  await supabase
    .from('key_result_updates')
    .upsert({
      key_result_id: base.key_result_id,
      reporting_month: currentDate,
      target_value: Number(resolvedTarget),
    }, {
      onConflict: 'key_result_id,reporting_month'
    })
}

// SET TARGET
setTarget(prev => {
  // only set if empty (prevents overwrite)
  if (prev === '') {
    return resolvedTarget.toString()
  }
  return prev
})

         const currentValue =
  currentRow && currentRow.value !== null
    ? currentRow.value
    : ''

setValue(prev => {
  if (prev === '') {
    return currentValue.toString()
  }
  return prev
})


      setLastMonth(prevData?.value ?? '')

     const c = Number(currentValue || 0)
    const t = Number(resolvedTarget || 0)

if (t <= 0) {
  setScore('')
  return
}

const percent = Math.round((c / t) * 100)
setScore(`${percent}%`)
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

  return (
    l.includes('wait') ||
    l.includes('miss') ||
    l.includes('call out') ||
    l.includes('reschedule')
  )
}
const getScoreBackground = () => {
  const num = Number(score.replace('%', ''))

  if (!num && num !== 0) {
    return '#FFFFFF'
  }

  if (num >= 100) {
    return '#acf3c3d7' // green
  }

  if (num >= 90) {
    return '#fff4ccf3' // yellow
  }

  return '#f3b8b8d8' // red
}
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row}>
        <span>
  {label}
  {note && (
    <span
      style={{
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6,
        fontStyle: 'italic',
        opacity: 0.9
      }}
    >
      ({note})
    </span>
  )}
</span>

        <input style={prevCell} value={lastMonth} readOnly />

        <input
  style={targetCell}
  value={target}
          disabled={!isEditing}
          onChange={(e) => {
  const val = e.target.value.replace(/[^0-9.]/g, '')
  setTarget(val)
  setIsDirty(true)
}}
          onKeyDown={handleEnter}
        />

       <input
  style={currentCell}
  value={value}
          disabled={!isEditing}
          onChange={(e) => {
  const val = e.target.value.replace(/[^0-9]/g, '')
  setValue(val)
  setIsDirty(true)
}}
          onBlur={handleSave}
          onKeyDown={handleEnter}
        />

        <input
  style={{
    ...cell,
    backgroundColor: getScoreBackground(),
    fontWeight: 800,
    color: '#1E266D'
  }}
  value={score}
  readOnly
/>

        <button style={button} onClick={() => setShowInitiatives(!showInitiatives)}>
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
