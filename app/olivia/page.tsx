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

  const [oliviaStarts, setOliviaStarts] = useState(0)
  const [oliviaProduction, setOliviaProduction] = useState(0)
  const [oliviaWhitening, setOliviaWhitening] = useState(0)
  


  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [lastUpdated, setLastUpdated] = useState('')
  const [percentIntoPeriod, setPercentIntoPeriod] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  

  // 🔥 MASTER TARGETS (UI CONTROLLED)
  const [masterStartsTarget, setMasterStartsTarget] = useState('0')
  const [masterProductionTarget, setMasterProductionTarget] = useState('0')


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
        <h1 style={title}>Olivia - Treatment Coordinator</h1>

        <p style={description}>
          Increase revenue for the practice through production and collections while setting the standard for practice culture and patient experience.
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

        {/* OBJECTIVE 1 */}
        <Objective title="Objective 1: Patient Starts">
          <KeyResult label="Starts @ Home" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult 
  label="Total Starts (Individual)" 
  selectedMonth={selectedMonth} 
  isEditing={isEditing} 
  derivedTarget={Number(masterStartsTarget) / 2}
  setParentValue={setOliviaStarts}
/>
          <KeyResult label="SDS" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult 
  label="Total Production (Individual)" 
  selectedMonth={selectedMonth} 
  isEditing={isEditing} 
  derivedTarget={Number(masterProductionTarget) / 2}
  setParentValue={setOliviaProduction}
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
  setParentValue={setOliviaWhitening}
/>
        </Objective>

        {/* OBJECTIVE 4 (MASTER) */}
        <Objective title="Objective 4: TC Total Start Performance">
          <KeyResult
  label="Total Starts"
  selectedMonth={selectedMonth}
  isEditing={false}
  target={masterStartsTarget}
  setTarget={setMasterStartsTarget}
  
/>

          <KeyResult
  label="Total Production"
  selectedMonth={selectedMonth}
  isEditing={false}
  target={masterProductionTarget}
  setTarget={setMasterProductionTarget}
 
/>
          
        </Objective>

        {/* OBJECTIVE 5 */}
        <Objective title="Objective 5: TC Whitening Kits">
          <KeyResult 
  label="Total Whitening Kits" 
  selectedMonth={selectedMonth} 
  isEditing={false}
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
  const [localTarget, setLocalTarget] = useState('')
  const [dbTarget, setDbTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const [metricType, setMetricType] = useState('')
  const [showInitiatives, setShowInitiatives] = useState(false)
  const [loadedMonth, setLoadedMonth] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  // SYNC MASTER TARGET PROP INTO LOCAL STATE
useEffect(() => {
  if (target !== undefined) {
    setLocalTarget(target)
  }
}, [target])

  const isPercentage =
  metricType === 'percentage' ||
  label === 'Conversion Rate'
  const isCurrency =
  metricType === 'currency' ||
  label === 'Collections from Starts'
  const isComputed = computedLabels.includes(label)

  const formatCurrency = (val: string | number) => {
  if (val === '' || val === null || val === undefined) return ''
  return '$' + Number(val).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

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
      console.log("LABEL:", label)
      console.log("DB LABEL:", dbLabel)

      let base

if (label === "Total Whitening Kits") {
  const { data } = await supabase
    .from('key_results')
    .select('id')
    .eq('id', 'f4406ada-8fe2-42aa-9e84-c8c373e6dfe1')
    .maybeSingle()

  base = {
    key_result_id: data?.id
  }
} else {
  const { data } = await supabase
    .from('dashboard_okr_data')
    .select('*')
    .eq('user_name', 'Olivia')
    .eq('key_result_title', dbLabel)
    .maybeSingle()

  base = data

  console.log('BASE RESULT:', base)
  console.log('DB LABEL:', dbLabel)
}

      if (!base) return

      setKeyResultId(base.key_result_id)

        console.log("BASE OBJECT:", base)

    const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

const currentMonthKey = selectedMonth.toISOString()

const currentDate = formatDate(selectedMonth)

const prevDateObj = new Date(selectedMonth)
prevDateObj.setMonth(prevDateObj.getMonth() - 1)
const prevDate = formatDate(prevDateObj)

// ------------------------
// FETCH CURRENT ROW
// ------------------------

const { data: currentRow } = await supabase
  .from('key_result_updates')
  .select('value, target_value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', currentDate)
  .maybeSingle()

// ------------------------
// FETCH PREVIOUS TARGET
// ------------------------

const { data: prevRow } = await supabase
  .from('key_result_updates')
  .select('target_value')
  .eq('key_result_id', base.key_result_id)
  .lt('reporting_month', currentDate)
  .not('target_value', 'is', null)
  .order('reporting_month', { ascending: false })
  .limit(1)
  .maybeSingle()

// ------------------------
// RESOLVE TARGET
// ------------------------

const resolvedTarget =
  currentRow?.target_value ??
  prevRow?.target_value ??
  null

// ------------------------
// CARRY FORWARD TARGET
// ------------------------

if (currentRow?.target_value === null && resolvedTarget !== null) {
  await supabase
    .from('key_result_updates')
    .upsert({
      key_result_id: base.key_result_id,
      reporting_month: currentDate,
      target_value: resolvedTarget,
    }, {
      onConflict: 'key_result_id,reporting_month'
    })
}

// ------------------------
// SET TARGET (SAFE)
// ------------------------

if (loadedMonth !== currentMonthKey && !isDirty) {
  setLocalTarget(
    resolvedTarget !== null ? resolvedTarget.toString() : ''
  )
}

// ------------------------
// SET VALUE
// ------------------------

const currentValue = currentRow?.value ?? ''

if (loadedMonth !== currentMonthKey && !isDirty) {
 setValue(currentValue.toString())
  if (setParentValue && currentValue !== undefined) {
    setParentValue(Number(currentValue))
  }
  setLoadedMonth(currentMonthKey)
}

// ------------------------
// PREVIOUS MONTH VALUE
// ------------------------

const { data: prevData } = await supabase
  .from('key_result_updates')
  .select('value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', prevDate)
  .maybeSingle()

if (loadedMonth !== currentMonthKey) {
  setLastMonth(prevData?.value ?? '')
}

// ------------------------
// SCORE
// ------------------------

const c = Number(currentValue)
const t = Number(localTarget || 0)

if (t > 0) {
  setScore(Math.round((c / t) * 100) + '%')
}

        
      // =========================
// GLOBAL TOTALS (JORDYN + OLIVIA)
// =========================

if (
  label === "Total Starts" ||
  label === "Total Production" ||
  label === "Total Whitening Kits"
) {

  const getValue = async (user: string, krTitle: string) => {

    const { data: row } = await supabase
      .from('dashboard_okr_data')
      .select('key_result_id')
      .eq('user_name', user)
      .eq('key_result_title', krTitle)
      .maybeSingle()

    if (!row) return 0

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
  let olivia = 0

  if (label === "Total Starts") {
    jordyn = await getValue("Jordyn", labelMap["Total Starts (Individual)"])
    olivia = await getValue("Olivia", labelMap["Total Starts (Individual)"])
  }

  if (label === "Total Production") {
    jordyn = await getValue("Jordyn", labelMap["Total Production (Individual)"])
    olivia = await getValue("Olivia", labelMap["Total Production (Individual)"])
  }

  if (label === "Total Whitening Kits") {
    jordyn = await getValue("Jordyn", labelMap["Whitening Kits"])
    olivia = await getValue("Olivia", labelMap["Whitening Kits"])
  }

const total = jordyn + olivia

// =========================
// CURRENT VALUE
// =========================
setValue(total.toString())
setLoadedMonth(currentMonthKey)
// =========================
// SCORE CALCULATION 
// =========================
const t = Number(localTarget || 0)

if (t > 0) {
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

const getPrevValue = async (user: string, krTitle: string) => {
  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('user_name', user)
    .eq('key_result_title', krTitle)
    .maybeSingle()

  if (!row) return 0

  const { data: update } = await supabase
    .from('key_result_updates')
    .select('value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', prevReportingDate)
    .maybeSingle()

  return Number(update?.value ?? 0)
}

let prevJordyn = 0
let prevOlivia = 0

if (label === "Total Starts") {
  prevJordyn = await getPrevValue("Jordyn", labelMap["Total Starts (Individual)"])
  prevOlivia = await getPrevValue("Olivia", labelMap["Total Starts (Individual)"])
}

if (label === "Total Production") {
  prevJordyn = await getPrevValue("Jordyn", labelMap["Total Production (Individual)"])
  prevOlivia = await getPrevValue("Olivia", labelMap["Total Production (Individual)"])
}

if (label === "Total Whitening Kits") {
  prevJordyn = await getPrevValue("Jordyn", labelMap["Whitening Kits"])
  prevOlivia = await getPrevValue("Olivia", labelMap["Whitening Kits"])
}

const prevTotal = prevJordyn + prevOlivia

setLastMonth(prevTotal.toString())



return
}



         if (t > 0) {
        setScore(Math.round((c / t) * 100) + '%')
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
    target_value: localTarget === '' ? null : Number(localTarget),
  },
  { onConflict: 'key_result_id,reporting_month' }
)
  }

  const getScoreColor = () => {
    const num = Number(score.replace('%', ''))
    return num >= 100 ? '#22c55e' : '#c2410c'
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row}>
        <span>{label}</span>

        <input
          style={cell}
          value={
  isCurrency && lastMonth
  ? formatCurrency(lastMonth)
   : isPercentage && lastMonth
  ? Number(lastMonth) + '%'
    : lastMonth
}
          readOnly
        />

        <input
          style={cell}
          value={
  isEditing
    ? localTarget
    : isCurrency && localTarget
    ? formatCurrency(localTarget)
    : isPercentage && localTarget
    ? localTarget + '%'
    : localTarget
}

          disabled={
  !isEditing && !target
}
       onChange={(e) => {
  let val = ''

  if (isCurrency || isPercentage) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')

    val = parts[0]

    if (parts.length > 1) {
      val += '.' + parts[1].slice(0, 2)
    }
  } else {
    val = e.target.value.replace(/[^0-9]/g, '')
  }

  setLocalTarget(val)
  setIsDirty(true)

  // 🔥 THIS IS THE FIX
  if (setTarget) {
    setTarget(val)
  }
}}
          onKeyDown={handleEnter}
        />

        <input
  style={cell}
  value={
  forcedValue !== undefined
    ? (isCurrency
        ? formatCurrency(forcedValue)
        : forcedValue)
    : (
        isEditing
          ? value
          : isCurrency && value
          ? formatCurrency(value)
          : isPercentage && value
          ? value + '%'
          : value
      )
}
  disabled={!isEditing || (isComputed && label !== "Total Whitening Kits")}
  onChange={(e) => {
    let val = ''

    if (isCurrency || isPercentage) {
  const raw = e.target.value.replace(/[^0-9.]/g, '')
  const parts = raw.split('.')

  val = parts[0]

  if (parts.length > 1) {
    val += '.' + parts[1].slice(0, 2)
  }
} else {
  const raw = e.target.value.replace(/[^0-9.]/g, '')
  const parts = raw.split('.')

  val = parts[0]

  if (parts.length > 1) {
    val += '.' + parts[1].slice(0, 2)
  }
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

        <input style={{ ...cell, color: getScoreColor() }} value={score} readOnly />

        <button style={button} onClick={() => setShowInitiatives(!showInitiatives)}>
          {showInitiatives ? 'Hide' : '+ Initiatives'}
        </button>
      </div>

      {showInitiatives && (
        <div style={initiativeRow}>
          <input style={cell} placeholder="Initiative 1..." />
          <input style={cell} placeholder="Initiative 2..." />
          <input style={cell} placeholder="Initiative 3..." />
        </div>
      )}
    </div>
  )
}

// =========================
// STYLES (UNCHANGED)
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

const content : React.CSSProperties = { padding: 20 }

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

