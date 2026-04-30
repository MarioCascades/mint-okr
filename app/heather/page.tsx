'use client'

export const dynamic = 'force-dynamic'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { supabase } from '../../lib/supabase'


// =========================
// LABEL MAP
// =========================

const labelMap: Record<string, string> = {
  "Starts @ Home": "TC Start at Home",
  "Total Starts (Individual)": "Total Starts (Individual)",
  "SDS": "TC SDS",
  "Total Production (Individual)": "Total Production (Individual)",
  "Collections from Starts": "TC Collections from Starts",
  "Scheduled New Patients": "TC Scheduled New Patients",
  "Kept New Patients": "TC Kept New Patients",
  "Conversion Rate": "TC Conversion Rate",
  "Whitening Kits": "TC Whitening Kits",
  "Total Starts": "Total TC Starts",
  "Total Production": "TC Total Production after Discounts",
  "Total Whitening Kits": "TC Total Whitening Kits"
}

const SHARED_KR_TITLES: Record<string, string> = {
  "Total Starts": "Total Starts",
  "Total Production": "Total Production",
  "Total Whitening Kits": "TC Total Whitening Kits"
}

const computedLabels = [
  "Total Starts",
  "Total Production",
  "Total Whitening Kits"
]

// =========================
// PAGE
// =========================

export default function Page() {

  const router = useRouter()

  const [heatherStarts, setHeatherStarts] = useState(0)
  const [heatherProduction, setHeatherProduction] = useState(0)
  const [heatherWhitening, setHeatherWhitening] = useState(0)
  


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
        <h1 style={title}>Heather - Treatment Coordinator</h1>

        <p style={description}>
          Increase revenue for the practice through production and collections while setting the standard for practice culture and patient experience.
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

        {/* OBJECTIVE 1 */}
        <Objective title="Objective 1: Patient Starts">
          <KeyResult label="Starts @ Home" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult 
  label="Total Starts (Individual)" 
  selectedMonth={selectedMonth} 
  isEditing={isEditing} 
 derivedTarget={undefined}
  setParentValue={setHeatherStarts}
/>
          <KeyResult label="SDS" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult 
  label="Total Production (Individual)" 
  selectedMonth={selectedMonth} 
  isEditing={isEditing} 
derivedTarget={undefined}
  setParentValue={setHeatherProduction}
/>
          <KeyResult label="Collections from Starts" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        {/* OBJECTIVE 2 */}
        <Objective title="Objective 2: New Patient Conversion">
          <KeyResult label="Scheduled New Patients" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Kept New Patients" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Conversion Rate" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        {/* OBJECTIVE 3 */}
        <Objective title="Objective 3: Whitening Kits">
          <KeyResult 
  label="Whitening Kits" 
  selectedMonth={selectedMonth} 
  isEditing={isEditing} 
  setParentValue={setHeatherWhitening}
/>
        </Objective>

        {/* OBJECTIVE 4 (MASTER) */}
        <Objective title="Objective 4: TC Total Start Performance">

     <KeyResult
  label="Total Starts"
  selectedMonth={selectedMonth}
  isEditing={isEditing}
/>

          <KeyResult
  label="Total Production"
  selectedMonth={selectedMonth}
  isEditing={isEditing}
/>
          
        </Objective>

               {/* OBJECTIVE 5 */}
<Objective title="Objective 5: TC Whitening Kits">
  <KeyResult 
    label="Total Whitening Kits" 
    selectedMonth={selectedMonth} 
    isEditing={isEditing}
  />
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
// KEY RESULT (FULL LOGIC)
// =========================




const KeyResult = ({ label, selectedMonth, isEditing, target, setTarget, derivedTarget, setParentValue, forcedValue }: any) => {

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [dbTarget, setDbTarget] = useState('')
  const [localTarget, setLocalTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const [metricType, setMetricType] = useState('')
  const [showInitiatives, setShowInitiatives] = useState(false)
  const [initiatives, setInitiatives] = useState([
  '',
  '',
  ''
])
  const [isDirty, setIsDirty] = useState(false)
  const [loadedMonth, setLoadedMonth] = useState('')

  const isPercentage =
  metricType === 'percentage' ||
  label === 'Conversion Rate'
  const isCurrency =
  metricType === 'currency' ||
  label === 'Collections from Starts'
  const isComputed = computedLabels.includes(label)

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

const dbLabel = labelMap[label]

let keyResultIdLocal: string | null = null

// =======================================
// HANDLE SHARED KRs (DIRECT - FIXED)
// =======================================

if (
  label === "Total Starts" ||
  label === "Total Production" ||
  label === "Total Whitening Kits"
) {

const sharedTitle =
  label === "Total Starts"
    ? "Total TC Starts"
    : label === "Total Production"
    ? "TC Total Production after Discounts"
    : "TC Total Whitening Kits"

const { data: sharedKR } = await supabase
  .from('key_results')
  .select('id, metric_type')
  .eq('title', sharedTitle)
  .maybeSingle()

  if (!sharedKR) {
    console.warn("Missing SHARED KR:", sharedTitle)
    return
  }

  keyResultIdLocal = sharedKR.id
  setKeyResultId(sharedKR.id)
  setMetricType(sharedKR.metric_type)

}else{

// =======================================
// NORMAL USER KRs (HEATHER)
// =======================================
const { data: base } = await supabase
  .from('dashboard_okr_data')
  .select('key_result_id')
  .eq('user_id', 'a34ec871-9a02-4c62-858c-4344726f9251')
  .eq('key_result_title', dbLabel)
  .maybeSingle()

  if (!base || !base.key_result_id) {
    console.warn("Missing KR for Heather:", label, dbLabel)
    return
  }

  keyResultIdLocal = base.key_result_id
  setKeyResultId(base.key_result_id)

  const { data: kr } = await supabase
    .from('key_results')
    .select('metric_type')
    .eq('id', base.key_result_id)
    .maybeSingle()

  setMetricType(kr?.metric_type ?? '')
}
 
const initiativeDate = `${selectedMonth.getFullYear()}-${String(
  selectedMonth.getMonth() + 1
).padStart(2, '0')}-01`

const { data: currentInitiatives } = await supabase
  .from('initiatives')
  .select('initiative_index, text')
  .eq('key_result_id', keyResultIdLocal)
  .eq('reporting_month', initiativeDate)
  .order('initiative_index', { ascending: true })

let loaded = ['', '', '']

if (currentInitiatives && currentInitiatives.length > 0) {
  currentInitiatives.forEach((row) => {
    if (row.initiative_index >= 1 && row.initiative_index <= 3) {
      loaded[row.initiative_index - 1] = row.text || ''
    }
  })
} else {
  const { data: previousInitiatives } = await supabase
    .from('initiatives')
    .select('initiative_index, text, reporting_month')
    .eq('key_result_id', keyResultIdLocal)
    .lt('reporting_month', initiativeDate)
    .order('reporting_month', { ascending: false })
    .order('initiative_index', { ascending: true })

  if (previousInitiatives && previousInitiatives.length > 0) {
    const latestMonth = previousInitiatives[0].reporting_month

    previousInitiatives
      .filter((row) => row.reporting_month === latestMonth)
      .forEach((row) => {
        if (row.initiative_index >= 1 && row.initiative_index <= 3) {
          loaded[row.initiative_index - 1] = row.text || ''
        }
      })
  }
}

setInitiatives(loaded)
        

      const { data: kr } = await supabase
        .from('key_results')
        .select('target_value, metric_type')
        .eq('id', keyResultIdLocal)
        .maybeSingle()


    
// =======================
// DATE SETUP
// =======================
const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

const currentDate = formatDate(selectedMonth)
const currentMonthKey = selectedMonth.toISOString()    

const prev = new Date(selectedMonth)
prev.setMonth(prev.getMonth() - 1)
const prevDate = formatDate(prev)


// =======================
// TARGET (MONTHLY SYSTEM)
// =======================
const { data: currentRows } = await supabase
  .from('key_result_updates')
  .select('target_value')
  .eq('key_result_id', keyResultIdLocal)
  .eq('reporting_month', currentDate)

const currentRow = currentRows?.[0] ?? null

  const { data: prevRows } = await supabase
  .from('key_result_updates')
  .select('target_value')
  .eq('key_result_id', keyResultIdLocal)
  .eq('reporting_month', prevDate)

const prevRow = prevRows?.[0] ?? null

const resolvedTarget =
  currentRow?.target_value ??
  prevRow?.target_value ??
  kr?.target_value ??
  ''


  if (!currentRow && resolvedTarget !== null && resolvedTarget !== '') {
  await supabase
    .from('key_result_updates')
    .upsert(
      {
        key_result_id: keyResultIdLocal,
        reporting_month: currentDate,
        target_value: resolvedTarget,
      },
      { onConflict: 'key_result_id,reporting_month' }
    )
}

  console.log("TARGET ROWS:", { currentRow, prevRow, kr })

setDbTarget(resolvedTarget ? resolvedTarget.toString() : '')
setMetricType(kr?.metric_type ?? '')

if (!isDirty) {
  setLocalTarget(
    resolvedTarget !== null && resolvedTarget !== undefined
      ? String(resolvedTarget)
      : ''
  )
}

      const { data: current } = await supabase
        .from('key_result_updates')
        .select('value')
        .eq('key_result_id', keyResultIdLocal)
        .eq('reporting_month', currentDate)
        .maybeSingle()

      const currentValue = current?.value ?? ''
        
// =========================
// PREVIOUS MONTH (NORMAL KRs)
// =========================
const { data: prevValueRow } = await supabase
  .from('key_result_updates')
  .select('value')
  .eq('key_result_id', keyResultIdLocal)
  .eq('reporting_month', prevDate)
  .maybeSingle()

const prevValue = prevValueRow?.value ?? ''

setLastMonth(prevValue !== '' && prevValue !== null ? prevValue.toString() : '')
// =========================
//  GLOBAL TOTALS (JORDYN + Heather)
// =========================

if (
  label === "Total Starts" ||
  label === "Total Production" ||
  label === "Total Whitening Kits"
) {

  const JORDYN_ID = "83b4a979-bef3-4418-9f71-fa7a77f53ed8"
  const HEATHER_ID = "a34ec871-9a02-4c62-858c-4344726f9251" // Mint Heather

  const getValue = async (userId: string, krTitle: string) => {

    const { data: row } = await supabase
      .from('dashboard_okr_data')
      .select('key_result_id')
      .eq('user_id', userId)
      .eq('key_result_title', krTitle)
      .maybeSingle()

    if (!row) {
      console.warn("Missing KR:", userId, krTitle)
      return 0
    }

    const y = selectedMonth.getFullYear()
    const m = String(selectedMonth.getMonth() + 1).padStart(2, '0')
    const reportingDate = `${y}-${m}-01`

    const { data: update } = await supabase
      .from('key_result_updates')
      .select('value')
      .eq('key_result_id', row.key_result_id)
      .eq('reporting_month', reportingDate)
      .maybeSingle()

    return Number(update?.value ?? 0)
  }

  let jordyn = 0
  let heather = 0

  if (label === "Total Starts") {
    jordyn = await getValue(JORDYN_ID, labelMap["Total Starts (Individual)"])
    heather = await getValue(HEATHER_ID, labelMap["Total Starts (Individual)"])
  }

  if (label === "Total Production") {
    jordyn = await getValue(JORDYN_ID, labelMap["Total Production (Individual)"])
    heather = await getValue(HEATHER_ID, labelMap["Total Production (Individual)"])
  }

  if (label === "Total Whitening Kits") {
    jordyn = await getValue(JORDYN_ID, labelMap["Whitening Kits"])
    heather = await getValue(HEATHER_ID, labelMap["Whitening Kits"])
  }

  const total = jordyn + heather
  
// =========================
// CURRENT VALUE
// =========================
setValue(total.toString())

// =========================
// SCORE CALCULATION (ADD THIS)
// =========================
const t = Number(resolvedTarget ?? kr?.target_value ?? 0)

if (t <= 0) {
  setScore('0%')
} else {
  setScore(Math.round((total / t) * 100) + '%')
}

// =========================
// PREVIOUS MONTH CALCULATION
// =========================

const prevDateObj = new Date(selectedMonth)
prevDateObj.setMonth(prevDateObj.getMonth() - 1)

const prevY = prevDateObj.getFullYear()
const prevM = String(prevDateObj.getMonth() + 1).padStart(2, '0')
const prevReportingDate = `${prevY}-${prevM}-01`



// FIXED FUNCTION
const getPrevValue = async (userId: string, krTitle: string) => {
  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('user_id', userId)
    .eq('key_result_title', krTitle)
    .maybeSingle()

  if (!row) {
    console.warn("Missing PREV KR:", userId, krTitle)
    return 0
  }

  const { data: update } = await supabase
    .from('key_result_updates')
    .select('value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', prevReportingDate)
    .maybeSingle()

  return Number(update?.value ?? 0)
}

let prevJordyn = 0
let prevHeather = 0

// FIXED CALLS (use IDs, not names)
if (label === "Total Starts") {
  prevJordyn = await getPrevValue(JORDYN_ID, labelMap["Total Starts (Individual)"])
  prevHeather = await getPrevValue(HEATHER_ID, labelMap["Total Starts (Individual)"])
}

if (label === "Total Production") {
  prevJordyn = await getPrevValue(JORDYN_ID, labelMap["Total Production (Individual)"])
  prevHeather = await getPrevValue(HEATHER_ID, labelMap["Total Production (Individual)"])
}

if (label === "Total Whitening Kits") {
  prevJordyn = await getPrevValue(JORDYN_ID, labelMap["Whitening Kits"])
  prevHeather = await getPrevValue(HEATHER_ID, labelMap["Whitening Kits"])
}

const prevTotal = prevJordyn + prevHeather

setLastMonth(prevTotal.toString())

return
}

// USE DIRECT VALUE — NOT STATE
const c = Number(currentValue || 0)
const t = Number(resolvedTarget ?? kr?.target_value ?? 0)

if (t === 0) {
  setScore('0%')
} else {
  const percent = Math.round((c / t) * 100)
  setScore(percent + '%')
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
    value: value ? Number(value) : null,
    target_value: localTarget ? Number(localTarget) : null,
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
    l.includes('call out') ||
    l.includes('conversion') ||
    l.includes('wait')
  )
}

const getScoreBackground = () => {
  const num = Number(score.replace('%', ''))

  // handles empty safely
  if (!num && num !== 0) return '#FFFFFF'

  if (isLowerBetter(label)) {
    if (num <= 100) return '#acf3c3d7'   // green
    if (num <= 110) return '#fff4ccf3'   // yellow
    return '#f3b8b8d8'                   // red
  }

  if (num >= 100) return '#acf3c3d7'     // green
  if (num >= 90) return '#fff4ccf3'      // yellow
  return '#f3b8b8d8'                     // red
}

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row}>
        <span>{label}</span>

        <input
          style={prevCell}
          value={
  isCurrency && lastMonth
    ? '$' + Number(lastMonth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : isPercentage && lastMonth
  ? Number(lastMonth) + '%'
    : lastMonth
}
          readOnly
        />

        <input
          style={targetCell}
          value={
  isCurrency && localTarget
    ? '$' + localTarget
  : isPercentage && localTarget
    ? localTarget + '%'
  : localTarget
}
          disabled={!isEditing}

onChange={(e) => {
  let val = ''

  if (isCurrency || isPercentage) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.').slice(0, 2)

    val = parts[0]

    if (parts.length > 1) {
      val += '.' + parts[1].slice(0, 2)
    }
  } else {
    val = e.target.value.replace(/[^0-9]/g, '')
  }

  setLocalTarget(val)
  setIsDirty(true)
}}
onBlur={handleSave}
onKeyDown={handleEnter}
/>

        <input
          style={currentCell}
          value={
  forcedValue !== undefined
    ? (label === "Total Production"
        ? '$' + Number(forcedValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : forcedValue)
    : (
    isEditing
      ? value
      : isCurrency && value
      ? '$' + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : isPercentage && value
      ? value + '%'
      : value
  )
}
          disabled={!isEditing || (isComputed && label !== "Total Whitening Kits")}
          onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9.]/g, '')
              const parts = raw.split('.').slice(0, 2)

              let val = parts[0]

              if (parts.length > 1) {
          val += '.' + parts[1].slice(0, 2)
          }

setValue(val)
setIsDirty(true)

  if (setParentValue) {
    setParentValue(Number(val))
  }
}}
          onBlur={handleSave}
          onKeyDown={handleEnter}
        />

       <input
  style={{
    ...cell,
    backgroundColor: getScoreBackground(),
    fontWeight: 800
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