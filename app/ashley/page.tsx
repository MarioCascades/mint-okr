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

            <button style={backButton} onClick={() => router.push('/')}>
              ← Back to Main
            </button>     
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

  const sourceUserMap: Record<string, string> = {
    "# of Patients Waited 10+ Minutes": "Mari",

    "FD NP Scheduled (GF)": "Kelle",
    "FD NP Scheduled Next Month": "Kelle",
    "FD NP NSC": "Kelle",
  }

  const sourceUser = sourceUserMap[label] || 'Ashley'

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
const [isSaving, setIsSaving] = useState(false)

  const rowRef = useRef<HTMLDivElement | null>(null)

  

// FINAL TARGET LOGIC (stable)

 useEffect(() => {
  const loadData = async () => {

    const { data: baseData } = await supabase
  .from('dashboard_okr_data')
  .select('*')
  .eq('user_name', sourceUser)
  .eq('key_result_title', queryLabelMap[label] || label)
  .limit(1)

if (!baseData || baseData.length === 0) {
  console.log('NO MATCH FOUND FOR:', label)
  return
}

setKeyResultId(baseData[0].key_result_id)


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

const initiativeDate = `${selectedMonth.getFullYear()}-${String(
  selectedMonth.getMonth() + 1
).padStart(2, '0')}-01`

const initiativeNextMonth = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth() + 1,
  1
)

const { data: currentInitiatives } = await supabase
  .from('initiatives')
  .select('initiative_index, text')
  .eq('key_result_id', baseData[0].key_result_id)
  .gte('reporting_month', currentStart.toISOString())
  .lt('reporting_month', initiativeNextMonth.toISOString())
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
    .eq('key_result_id', baseData[0].key_result_id)
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

  const formatDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}
    const currentDate = formatDate(selectedMonth)


const { data: currentData } = await supabase
  .from('key_result_updates')
  .select('value, target_value')
  .eq('key_result_id', baseData[0].key_result_id)
  .eq('reporting_month', currentDate)
  .maybeSingle()

const rowExists = currentData !== null && currentData !== undefined

const hasValidTarget =
  rowExists &&
  currentData.target_value !== null &&
  currentData.target_value !== undefined

const currentValue =
  currentData &&
  currentData.value !== null &&
  currentData.value !== undefined
    ? currentData.value
    : ''

let currentTarget =
  currentData &&
  currentData.target_value !== null &&
  currentData.target_value !== undefined
    ? currentData.target_value
    : null

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

const prevDate = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-01`

const { data: prevDataList } = await supabase
  .from('key_result_updates')
  .select('value, target_value')
  .eq('key_result_id', baseData[0].key_result_id)
  .eq('reporting_month', prevDate)
  .maybeSingle()

const prevTarget = prevDataList?.target_value ?? null
const prevRow = prevDataList

const prevIsEmpty =
  prevRow?.value === 0 || prevRow?.value === null || prevRow?.value === undefined

const prevVal = prevIsEmpty ? '' : prevRow?.value

// FINAL TARGET LOGIC (READ ONLY — NO WRITES)
if (
  currentData?.target_value !== null &&
  currentData?.target_value !== undefined
) {
  currentTarget = currentData.target_value
} else if (
  prevTarget !== null &&
  prevTarget !== undefined
) {
  currentTarget = prevTarget
}
setLastMonth(
  percentageMetrics.includes(label)
    ? prevVal !== ''
      ? String(
          Number(prevVal) <= 1
            ? Number(prevVal) * 100 + "%"
            : Number(prevVal)
        )
      : ''
    : prevVal !== ''
    ? String(prevVal)
    : ''
)

setTarget(
  currentTarget !== null && currentTarget !== undefined
    ? percentageMetrics.includes(label)
      ? String(
          Number(currentTarget) <= 1
            ? Number(currentTarget) * 100
            : Number(currentTarget)
        )
      : String(currentTarget)
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

 if (percentageMetrics.includes(label)) {
  setScore(value ? value + '%' : '—')
  return
}

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

setIsSaving(true)  
console.log('HANDLE SAVE FIRED:', label, value, target, passedId, keyResultId)
  const finalId = passedId || keyResultId
  console.log('FINAL ID USED:', finalId)

if (!finalId) {
  console.log('keyResultId missing, skipping save')
  return
}
// ALWAYS allow saving if target exists
if (!keyResultId) return
 const monthToUse = monthOverride
  ? new Date(monthOverride)
  : new Date(selectedMonth)

  console.log('USING MONTH:', monthToUse)

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
setTimeout(() => {
  setIsSaving(false)
}, 500)
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

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row} ref={(el) => {
  rowRef.current = el
}}
>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
  <span>{displayLabelMap[label] || label}</span>

  {sourceUser !== 'Ashley' && (
    <span style={{
      fontSize: 11,
      color: '#6B7280',
      fontStyle: 'italic'
    }}>
      Pulls from {sourceUser}
    </span>
  )}
</div>

        <input style={prevCell} value={lastMonth} readOnly />

<input
  style={targetCell}
  value={
    percentageMetrics.includes(label) && target !== ''
      ? target + '%'
      : target
  }
  disabled={!isEditing}
  onChange={(e) => {
    const val = e.target.value
    if (/^\d*\.?\d*$/.test(val)) {
      setTarget(val)
    }
  }}
/>

<input
  style={currentCell}
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
    ...scoreCellBase,
    backgroundColor: (() => {
      if (!score.includes('%')) return '#FFFFFF'

      const value = Number(score.replace('%', ''))

      if (isNaN(value)) return '#FFFFFF'

      if (value >= 100) return '#acf3c3d7'
      if (value >= 90) return '#fff4ccf3'
      return '#f3b8b8d8'
    })()
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
// STYLES (unchanged)
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
  backgroundColor: '#E5E5E5',
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
  color: '#6B7280',
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