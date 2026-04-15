'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
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
  const isMarchOrLater =
  selectedMonth >= new Date(2026, 2, 1) // March = month index 3

  

  // =========================
  // % INTO PERIOD
  // =========================

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

  // =========================
  // LAST UPDATED
  // =========================

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

      {/* HEADER */}
      <div style={stickyHeader}>

        <h1 style={title}>Ashley - Front Desk Manager (Patient Experience & Scheduling Lead)</h1>

        <p style={description}>
          Responsible for delivering an exceptional first impression, maximizing new patient conversion, and maintaining an efficient, fully optimized schedule. This role drives practice growth by owning phone performance, new patient intake, referral engagement, and front desk systems while leading and supporting the front desk team to ensure consistency and efficiency.
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

            <button
  style={editButton}
 onClick={async () => {

 if (isEditing) {
  await new Promise((r) => setTimeout(r, 300))

  const event = new CustomEvent('save-all', {
  detail: { selectedMonth }
})
window.dispatchEvent(event)
}

  setIsEditing(!isEditing)
}}
>
  {isEditing ? 'Save' : 'Edit'}
</button>

          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div style={content}>
        {isMarchOrLater && (
  <>

        <Objective title="Objective 1: Office Efficiency">
          

  <KeyResult
    label="FD Call Answer Rate"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

  <KeyResult
    label="FD # of Missed Calls"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

  <KeyResult
    label="# of Patients Waited 10+ Minutes"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

  <KeyResult
    label="FD # of tasks in Lead Sigma"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

</Objective>

<Objective title="Objective 2: Bright Referral">

  <KeyResult
  label="FD Referring Offices"
  selectedMonth={selectedMonth}
  isEditing={isEditing}
/>

<KeyResult
  label="FD Bright Referral Users"
  selectedMonth={selectedMonth}
  isEditing={isEditing}
/>

<KeyResult
  label="FD Bright Referral Inquiries"
  selectedMonth={selectedMonth}
  isEditing={isEditing}
/>

<KeyResult
  label="FD Bright Referral Reception Rate"
  selectedMonth={selectedMonth}
  isEditing={isEditing}
/>

</Objective>

<Objective title="Objective 3: New Patient Process">

  <KeyResult
    label="FD NP Scheduled (GF)"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

  <KeyResult
    label="FD NP Scheduled Next Month"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

  <KeyResult
    label="FD NP NSC"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

  <KeyResult
    label="FD New Patients Missing Information (EOD NP Prep)"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

</Objective>

<Objective title="Objective 4: RETAIN Engagement">

  <KeyResult
    label="Retain Invited"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

  <KeyResult
    label="Retain Subscribed"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
  />

</Objective>
  </>
)}
{!isMarchOrLater && (
  <>

    <Objective title="Objective 1: Understanding Referral Mix">

      <KeyResult
        label="FD Patient Referral"
        selectedMonth={selectedMonth}
        isEditing={isEditing}
      />

      <KeyResult
        label="FD Dental Referrals"
        selectedMonth={selectedMonth}
        isEditing={isEditing}
      />

      <KeyResult
        label="FD # of Dentists Referred"
        selectedMonth={selectedMonth}
        isEditing={isEditing}
      />

      <KeyResult
        label="FD Digital Marketing"
        selectedMonth={selectedMonth}
        isEditing={isEditing}
      />

    </Objective>


    <Objective title="Objective 2: Inquiry Tracking">

      <KeyResult
        label="FD DM Engage"
        selectedMonth={selectedMonth}
        isEditing={isEditing}
      />

      <KeyResult
        label="FD Reception Rate DM Engage"
        selectedMonth={selectedMonth}
        isEditing={isEditing}
      />

      <KeyResult
        label="FD Bright Referral"
        selectedMonth={selectedMonth}
        isEditing={isEditing}
      />

    </Objective>


    <Objective title="Objective 3: New Patient Process">

      <KeyResult
        label="FD NP Scheduled (GF)"
        selectedMonth={selectedMonth}
        isEditing={isEditing}
      />

      <KeyResult
        label="FD NP Incomplete Appointment"
        selectedMonth={selectedMonth}
        isEditing={isEditing}
      />

    </Objective>

  </>
)}

      </div>
    </div>
  )
}
// =========================
// DISPLAY LABEL MAP
// =========================

const displayLabelMap: Record<string, string> = {
  "FD Obs Due Next Month, This Month, and Last Month": "Observation Patients Due (Next / This / Last)",
  "FD Obs Overdue 30+": "Observation Patients Overdue 30+ Days",
  "FD Obs No Show": "Observation Patient No Shows",
  // April OKRs
"FD Call Answer Rate": "Call Answer Rate",
"FD # of Missed Calls": "# of Missed Calls",
"# of Patients Waited 10+ Minutes": "Patients Waited 10+ Minutes",
"FD # of tasks in Lead Sigma": "Tasks in Lead Sigma",

"FD Bright Referral": "Bright Referral",
"FD Reception Rate Bright Referral": "Reception Rate (Bright Referral)",
"FD DM Engage": "DM Engage",
"FD Reception Rate DM Engage": "Reception Rate (DM Engage)",

"FD NP Scheduled (GF)": "NP Scheduled",
"FD NP Scheduled Next Month": "NP Scheduled (Next Month)",
"FD NP NSC": "NP NSC",
"FD New Patients Missing Information (EOD NP Prep)": "Missing NP Info (EOD Prep)",
"FD Referring Offices": "Referring Offices",
"FD Bright Referral Users": "Bright Referral Users",
"FD Bright Referral Inquiries": "Bright Referral Inquiries",
"FD Bright Referral Reception Rate": "Bright Referral Reception Rate",

// OLD OKRs (March)

"FD Patient Referral": "Patient Referral",
"FD Dental Referrals": "Dental Referrals",
"FD # of Dentists Referred": "# of Dentists Referred",
"FD Digital Marketing": "Digital Marketing",

"FD NP Incomplete Appointment": "NP Incomplete Appointment",
// Fix for missing mappings (April)
"Retain Invited": "Retain Invited",
"Retain Subscribed": "Retain Subscribed",
}
const queryLabelMap: Record<string, string> = {
  // April (exact DB titles)
  "FD Call Answer Rate": "FD Call Answer Rate",
  "FD # of Missed Calls": "FD # of Missed Calls",
  "# of Patients Waited 10+ Minutes": "# of Patients Waited 10+ Minutes",

  "FD Bright Referral": "FD Bright Referral",
  "FD Reception Rate Bright Referral": "FD Reception Rate Bright Referral",
  "FD DM Engage": "FD DM Engage",
  "FD Reception Rate DM Engage": "FD Reception Rate DM Engage",

  "FD NP Scheduled (GF)": "FD NP Scheduled (GF)",
  "FD NP Scheduled Next Month": "FD NP Scheduled Next Month",
  "FD New Patients Missing Information (EOD NP Prep)": "FD New Patients Missing Information (EOD NP Prep)",

  "Retain Invited": "FD Retain Invited",
  "Retain Subscribed": "FD Retain Subscribed",

  // These currently DO NOT exist in DB (will not show until inserted)
  "FD # of tasks in Lead Sigma": "FD # of tasks in Lead Sigma",
  "FD NP NSC": "FD NP NSC",

  // March (missing in DB)
  "FD Patient Referral": "FD Patient Referral",
  "FD Dental Referrals": "FD Dental Referrals",
  "FD # of Dentists Referred": "FD # of Dentists Referred",
  "FD Digital Marketing": "FD Digital Marketing",
  "FD NP Incomplete Appointment": "FD NP Incomplete Appointment",
}

const directionMap: Record<string, 'increase' | 'decrease' | 'none'> = {
  // Decrease metrics (lower is better)
  "FD # of Missed Calls": "decrease",
  "FD NP NSC": "decrease",
  "# of Patients Waited 10+ Minutes": "decrease",
  "FD NP Incomplete Appointment": "decrease",

  // No score metrics
  "FD # of tasks in Lead Sigma": "none",
  
}
const percentageMetrics = [
  "FD Call Answer Rate",
  "FD Reception Rate Bright Referral",
  "FD Reception Rate DM Engage",
]

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



const KeyResult: React.FC<any> = ({ label, selectedMonth, isEditing }) => {

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [target, setTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const [showInitiatives, setShowInitiatives] = useState(false)


  const rowRef = useRef<HTMLDivElement | null>(null)

  

// FINAL TARGET LOGIC (stable)

 useEffect(() => {
  const loadData = async () => {

    const { data: baseData } = await supabase
  .from('dashboard_okr_data')
  .select('*')
  .eq('user_name', 'Ashley')
  .eq('key_result_title', queryLabelMap[label] || label)
  .limit(1)

if (!baseData || baseData.length === 0) {
  console.log('NO MATCH FOUND FOR:', label)
  return
}

setKeyResultId(baseData[0].key_result_id)

  const formatDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}
    const currentDate = formatDate(selectedMonth)

const currentStart = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth(),
  1
)

const nextMonth = new Date(selectedMonth)
nextMonth.setMonth(nextMonth.getMonth() + 1)

const currentEnd = new Date(
  nextMonth.getFullYear(),
  nextMonth.getMonth(),
  1
)

const { data: currentData } = await supabase
  .from('key_result_updates')
  .select('value, target_value')
 .eq('key_result_id', baseData[0].key_result_id)
 .eq('reporting_month', currentDate)
  .maybeSingle()

const isEmptyRow =
  currentData?.value === 0 &&
  (currentData?.target_value === null || currentData?.target_value === undefined)

const currentValue =
  currentData?.value !== null &&
  currentData?.value !== undefined &&
  !isEmptyRow
    ? currentData.value
    : ''
const currentTarget =
  currentData?.target_value !== null &&
  currentData?.target_value !== undefined &&
  !isEmptyRow
    ? currentData.target_value
    : ''

const currentMonthKey = selectedMonth.toISOString()

const formattedValue =
  currentValue === ''
    ? ''
    : percentageMetrics.includes(label)
      ? String(Number(currentValue) * 100)
      : String(currentValue)

setValue(formattedValue)

 const prev = new Date(selectedMonth)
prev.setMonth(prev.getMonth() - 1)

const prevStart = new Date(prev.getFullYear(), prev.getMonth(), 1)

const prevEnd = new Date(prevStart)
prevEnd.setMonth(prevEnd.getMonth() + 1)

const { data: prevData } = await supabase
  .from('key_result_updates')
  .select('value')
 .eq('key_result_id', baseData[0].key_result_id)
  .eq('reporting_month', formatDate(prev))
  .maybeSingle()

  const prevIsEmpty =
  prevData?.value === 0 || prevData?.value === null || prevData?.value === undefined

const prevVal = prevIsEmpty ? '' : prevData?.value

setLastMonth(
  percentageMetrics.includes(label)
    ? prevVal !== '' ? String(prevVal * 100) : ''
    : prevVal !== '' ? String(prevVal) : ''
)
 setTarget(
  currentTarget !== null && currentTarget !== undefined
    ? String(currentTarget)
    : ''
)
}

  loadData()
}, [label, selectedMonth])

useEffect(() => {
  const direction = directionMap[label] || 'increase'

  const numericValue = Number(value)
  const numericTarget = Number(target)

  if (direction === 'none') {
    setScore('—')
    return
  }

  if (!numericTarget || numericTarget === 0) {
    setScore('—')
    return
  }

  let percent = 0

  if (direction === 'increase') {
    percent = Math.round((numericValue / numericTarget) * 100)
  } else {
    percent = numericValue === 0
      ? 100
      : Math.round((numericTarget / numericValue) * 100)
  }

  setScore(percent + '%')

}, [value, target, label])


  useEffect(() => {
 const handleGlobalSave = async (e: any) => {
  const monthFromEvent = e.detail?.selectedMonth

  if (!monthFromEvent) return

  // wait briefly to ensure keyResultId is set
  

  if (!keyResultId) {
  console.log('BLOCKED SAVE — missing keyResultId', label)
  return
}

console.log('GLOBAL SAVE USING ID:', keyResultId, 'LABEL:', label)
  handleSave(monthFromEvent, keyResultId)
}
  window.addEventListener('save-all', handleGlobalSave)

  return () => {
    window.removeEventListener('save-all', handleGlobalSave)
  }
}, [keyResultId, value, target, selectedMonth])

const handleSave = async (monthOverride?: Date, passedId?: string | null) => {
console.log('HANDLE SAVE FIRED:', label, value, target, passedId, keyResultId)
  const finalId = passedId || keyResultId
  console.log('FINAL ID USED:', finalId)

if (!finalId) {
  console.log('keyResultId missing, skipping save')
  return
}
const hasValue = value !== '' && value !== null && value !== '0'
const hasTarget = target !== '' && target !== null

if (!hasValue && !hasTarget) {
  console.log('skipping untouched row:', label)
  return
}
 const monthToUse = monthOverride || selectedMonth

const reportingDate = `${monthToUse.getFullYear()}-${String(
  monthToUse.getMonth() + 1
).padStart(2, '0')}-01`


  console.log('SAVE ATTEMPT:', {
  keyResultId,
  value,
  target,
  reportingDate
})
console.log('FINAL SAVE:', {
  label,
  keyResultId,
  value,
  target,
  reportingDate
})

  const cleanTarget = target?.toString().trim()
  const parsedValue = value === '' ? null : Number(value)
const parsedTarget = target === '' ? null : Number(target)

const { data, error } = await supabase
  .from('key_result_updates')
  .upsert(
    {
      key_result_id: finalId,
      reporting_month: reportingDate,
      value:
        value === '' ? null :
        percentageMetrics.includes(label)
          ? Number(value) / 100
          : Number(value),
      target_value:
  cleanTarget === '' ? null : Number(cleanTarget),
    },
    { onConflict: 'key_result_id,reporting_month' }
  )
  .select()

console.log('SAVE RESULT:', { data, error, value, target, keyResultId, reportingDate })
}

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row} ref={(el) => {
  rowRef.current = el
}}
>
       <span>{displayLabelMap[label] || label}</span>

        <input style={cell} value={lastMonth} readOnly />

<input
  style={cell}
  value={target}
  disabled={!isEditing}
  onChange={(e) => {
    const val = e.target.value
    if (/^\d*\.?\d*$/.test(val)) {
      setTarget(val)
    }
  }}
/>

<input
  style={cell}
  value={
    percentageMetrics.includes(label) && value !== ''
      ? value + '%'
      : value
  }
  disabled={!isEditing}
  onChange={(e) => {
    let val = e.target.value.replace('%', '')
    if (/^\d*\.?\d*$/.test(val)) {
      setValue(val)
    }
  }}
/>

        <input 
 style={{ 
  ...cell, 
  color: (() => {
    if (!score.includes('%')) return '#9CA3AF' // neutral (—)

    const value = Number(score.replace('%',''))

    if (isNaN(value)) return '#9CA3AF'

    return value >= 100 ? '#22c55e' : '#c2410c'
  })()
}}
  value={score} 
  readOnly 
/>

        <button style={button} onClick={() => setShowInitiatives(!showInitiatives)}>
          {showInitiatives ? 'Hide' : '+ Initiatives'}
        </button>
      </div>
    </div>
  )
}

// =========================
// STYLES (unchanged)
// =========================

const container : React.CSSProperties = { backgroundColor: '#000', minHeight: '100vh', color: '#fff' }
const stickyHeader : React.CSSProperties = { 
  position: 'sticky', 
  top: 60, // push below TopNav
  zIndex: 10,
  backgroundColor: '#000',
  padding: 20,
  borderBottom: '1px solid #1F2937'
}
const content : React.CSSProperties = { padding: 20 }
const title : React.CSSProperties = { fontSize: 24, fontWeight: 700 }
const description : React.CSSProperties = { fontSize: 14, color: '#9CA3AF', marginBottom: 20, maxWidth: 800 }
const topSection : React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 20 }
const leftMeta : React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }
const rightMeta : React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }
const metaItem : React.CSSProperties = { display: 'flex', flexDirection: 'column' }
const label : React.CSSProperties = { fontSize: 12, color: '#9CA3AF' }
const inputSmall : React.CSSProperties = { height: 36, padding: '6px 10px', borderRadius: 6, border: '1px solid #1F2937', backgroundColor: '#0A0A0A', color: '#fff' }
const monthSelector : React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 }
const arrowButton : React.CSSProperties = { backgroundColor: '#1F2937', border: 'none', padding: '6px 10px', borderRadius: 6, color: '#fff' }
const editButton : React.CSSProperties = { backgroundColor: '#00AEEF', border: 'none', padding: '6px 12px', borderRadius: 6, color: '#000', fontWeight: 600, cursor: 'pointer' }
const backButton : React.CSSProperties = { backgroundColor: '#1F2937', border: 'none', padding: '6px 12px', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12 }
const monthText : React.CSSProperties = { fontSize: 14, fontWeight: 600 }
const objective : React.CSSProperties = { marginBottom: 40 }
const objectiveTitle: React.CSSProperties = { color: '#00AEEF' }
const headerRow : React.CSSProperties = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 8, marginBottom: 10 }
const row : React.CSSProperties = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 8, marginBottom: 6 }
const cell : React.CSSProperties = { background: '#0A0A0A', border: '1px solid #1F2937', borderRadius: 6, color: '#fff' }
const button : React.CSSProperties = { backgroundColor: '#00AEEF', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#000', fontSize: 12 }