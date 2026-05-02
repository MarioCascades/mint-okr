'use client'

export const dynamic = 'force-dynamic'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { supabase } from '../../lib/supabase'

// =========================
// HELPERS
// =========================

const formatPercent = (val: number) =>
  `${val.toFixed(2)}%`

// =========================
// PAGE
// =========================

export default function Page() {

  const router = useRouter()

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const isAprilOrLater = () => {
  const cutoff = new Date(2026, 3, 1) // April = 3
  return selectedMonth >= cutoff
}

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
        <h1 style={title}>Kelle - New Patient Intake + Experience Coordinator</h1>

        <p style={description}>
          The New Patient Intake & Experience Coordinator is responsible for ensuring every new patient is fully prepared prior to their appointment. This role owns the accuracy, completeness, and organization of all new patient information—eliminating friction, reducing delays, and creating a seamless, high-quality first visit experience.
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

  {isAprilOrLater() ? (
    <>
      {/* ========================= */}
      {/* NEW OKRs (APRIL+) */}
      {/* ========================= */}

    <Objective title="Objective 1: New Patient Process">
 <KeyResult 
  label="NP Scheduled (GF)" 
  selectedMonth={selectedMonth} 
  isEditing={isEditing}
  percentIntoPeriod={percentIntoPeriod}
/>
  <KeyResult label="NP Scheduled Next Month" selectedMonth={selectedMonth} isEditing={isEditing} />
  <KeyResult label="NP NSC" selectedMonth={selectedMonth} isEditing={isEditing} />
  <KeyResult label="New Patients Missing Information (EOD NP Prep)" selectedMonth={selectedMonth} isEditing={isEditing} />
 </Objective>
      <Objective title="Objective 2: DM Engage">
        <KeyResult label="DM Engage" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Reception Rate (inquiry to booked) for DM Engage" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 3: Bright Referral">
  <KeyResult 
  label="Bright Referral"
  selectedMonth={selectedMonth}
  isEditing={false}
  sourceKeyResultId="0dfdddda-c33d-45d8-ae93-69890b517d37"
  sourceLabel="Eric"
/>
  <KeyResult 
    label="Reception Rate (inquiry to booked) for Bright Referral"
    selectedMonth={selectedMonth}
    isEditing={false}
    sourceKeyResultId="8997f22b-95d1-49db-9085-16d0e3e49da2"
    sourceLabel="Eric"
  />
</Objective>

      <Objective title="Objective 4: Understanding Referral Mix">
        <KeyResult label="Patient Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Dental Referrals" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of Dentists Referred" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Digital Marketing" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Community" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

     <Objective title="Objective 5: Office Efficiency">
  <KeyResult 
    label="Call Answer Rate"
    selectedMonth={selectedMonth}
    isEditing={false}
    sourceKeyResultId="9380ff3b-c4b5-43b1-8fcd-f28968fdb2d6"
    sourceLabel="Ashley"
  />
  <KeyResult 
    label="# of Missed Calls"
    selectedMonth={selectedMonth}
    isEditing={false}
    sourceKeyResultId="6fcecbf1-cf9c-4e12-aa58-f2d7c70bae50"
    sourceLabel="Ashley"
  />
  <KeyResult 
    label="# of patients waited 10+ minutes"
    selectedMonth={selectedMonth}
    isEditing={false}
    sourceKeyResultId="28e8fea2-1c52-49a5-9eb6-91c23a7c24a8"
    sourceLabel="Mari"
  />
  <KeyResult 
    label="# of tasks in Lead Sigma"
    selectedMonth={selectedMonth}
    isEditing={isEditing}
    sourceKeyResultId="7b135619-57d6-4d3d-9cbd-2c91959365f7"
    sourceLabel="Ashley"
  />
</Objective>
    </>
  ) : (
    <>
      {/* ========================= */}
      {/* OLD OKRs (PRE-APRIL) */}
      {/* ========================= */}

      <Objective title="Objective 1: Understanding Referral Mix">
        <KeyResult label="Patient Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Dental Referrals" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of Dentists Referred" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Digital Marketing" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Community" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 2: Inquiry Tracking">
        <KeyResult label="DM Engage" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Reception Rate (inquiry to booked) for DM Engage" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Bright Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Reception Rate (inquiry to booked) for Bright Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 3: New Patient Process">
        <KeyResult label="NP Scheduled (GF) include consult inquiries" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="NP Incomplete Appointment" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 4: Phone/SMS Engagement">
        <KeyResult label="Call Answer Rate" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of Missed Calls" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 5: Tasks Tracking">
        <KeyResult label="# of tasks in Lead Sigma" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>
    </>
  )}

</div>
</div>
  )}

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
  sourceKeyResultId,
  sourceLabel,
  percentIntoPeriod
}: any) => {

  const KR_MAP: Record<string, string> = {

 "Patient Referral": "10354c03-f512-448e-9768-c67403aded87",
"Dental Referrals": "d55a03a3-ba57-40fe-af0a-b269155e3133",
"# of Dentists Referred": "dad83ca3-4fab-4b73-8e6a-db873ea0ca2a",
"Digital Marketing": "3b5b1a4a-e25f-41e4-849b-676d87bb4134",
"Community": "e3de00c1-b815-4c3a-99c5-b2354f0ababb",

  "DM Engage": "8775d9b2-7c5a-4751-8a68-39aa7248ba14",
  "Reception Rate (inquiry to booked) for DM Engage": "bcbd6805-e373-4b39-ac7b-25ea3e122c09",
  "Bright Referral": "f73bb83b-a651-4788-96ee-c8b82aeb4ff4",
  "Reception Rate (inquiry to booked) for Bright Referral": "e7e5deb0-5ddf-482b-a50d-18e20476946c",

"NP Scheduled (GF)": "cd8194e4-f8cf-479c-91a9-fb013aa4cc9a",
"NP Scheduled Next Month": "1a7f597e-ccab-4f95-91bb-e899d24bfaae",
"NP NSC": "9c4fb95d-0c07-45b9-be85-495760efed8d",
"New Patients Missing Information (EOD NP Prep)": "a6ddf32f-949c-45fd-9826-497c66e3e955",
  "NP Incomplete Appointment": "e215ac1d-f173-4d58-9286-444dcb3eeeae",

  "Call Answer Rate": "4902ee9f-d948-474f-9437-14a0d8976902",
  "# of Missed Calls": "cc6fcff3-8e37-486b-9c9f-bcc8e0235b3c",

  "# of tasks in Lead Sigma": "0ab7f27a-8cab-46b9-a8a1-671960a68c68",

  "# of patients waited 10+ minutes": "9dde3061-b067-41b7-9412-eaef4cd1c2c7",
  
}

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [target, setTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [showInitiatives, setShowInitiatives] = useState(false)

const [initiatives, setInitiatives] = useState([
  '',
  '',
  ''
])
  const percentLabels = [
  "Call Answer Rate",
  "Reception Rate (inquiry to booked) for DM Engage",
  "Reception Rate (inquiry to booked) for Bright Referral"
]

const isPercent = percentLabels.includes(label)
  const format = (v: number) => {
      if (isPercent) return formatPercent(v)
      return v.toString()
    }
    

  const getScoreColor = () => {
  const num = Number(score.replace('%', ''))
  if (isNaN(num)) return '#fff'
  return num >= 100 ? '#22c55e' : '#c2410c'
}

const handleSave = async () => {

  if (!keyResultId) return

  // Prevent save if user didn't edit anything
  if (!isDirty) return

  const y = selectedMonth.getFullYear()
  const m = String(selectedMonth.getMonth() + 1).padStart(2, '0')
  const reportingDate = `${y}-${m}-01`

  const cleanValue = parseFloat(String(value).replace('%', '')) || 0
  const parsedTarget = parseFloat(String(target).replace('%', ''))

  const payload: any = {
    key_result_id: keyResultId,
    reporting_month: reportingDate,
    value: cleanValue,
  }

  // Only include target if valid
  if (!isNaN(parsedTarget)) {
    payload.target_value = parsedTarget
  }

  await supabase
    .from('key_result_updates')
    .upsert(payload, {
      onConflict: 'key_result_id,reporting_month'
    })

  setIsDirty(false)
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
useEffect(() => {

  const fetchData = async () => {
    setIsDirty(false)


    
    let base = null

    

    //  STEP 1 — try ID match
   const mappedId = sourceKeyResultId || KR_MAP[label]

   // ALWAYS set keyResultId so saving works even if dashboard view is empty
if (mappedId) {
  setKeyResultId(mappedId)
}

    if (mappedId) {
      const { data } = await supabase
        .from('dashboard_okr_data')
        .select('*')
        .eq('key_result_id', mappedId)
        .maybeSingle()

      if (data) base = data
    }

    // STEP 2 — fallback
if (!mappedId) {
  console.log('MISSING MAP FOR:', label)
  return
}

const { data: baseData } = await supabase
  .from('dashboard_okr_data')
  .select('*')
  .eq('key_result_id', mappedId)
  .maybeSingle()

if (!baseData) {
  base = { key_result_id: mappedId, target_value: 0 }
} else {
  base = baseData
}


    if (!base) return

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
const previousMonthStart = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth() - 1,
  1
)

const previousMonthEnd = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth(),
  1
)

const { data: previousInitiatives } = await supabase
  .from('initiatives')
  .select('initiative_index, text')
  .eq('key_result_id', base.key_result_id)
  .gte('reporting_month', previousMonthStart.toISOString())
  .lt('reporting_month', previousMonthEnd.toISOString())
  .order('initiative_index', { ascending: true })

if (previousInitiatives && previousInitiatives.length > 0) {
  previousInitiatives.forEach((row) => {
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

const prevStart = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth() - 1,
  1
)

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

console.log('--- DEBUG PREV ---')
console.log('LABEL:', label)
console.log('PREV START:', prevStart.toISOString())
console.log('CURRENT START:', currentStart.toISOString())
console.log('NEXT MONTH:', nextMonth.toISOString())

const { data: currentData } = await supabase
  .from('key_result_updates')
  .select('value, target_value')
  .eq('key_result_id', base.key_result_id)
  .gte('reporting_month', currentStart.toISOString())
  .lt('reporting_month', nextMonth.toISOString())
  .maybeSingle()


const prevEnd = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth(),
  1
)

const { data: prevData } = await supabase
  .from('key_result_updates')
  .select('value, target_value')
  .eq('key_result_id', base.key_result_id)
  .gte('reporting_month', prevStart.toISOString())
  .lt('reporting_month', prevEnd.toISOString())
  .maybeSingle()
  console.log('PREV DATA RESULT:', prevData)

const prevVal =
  prevData?.value !== null && prevData?.value !== undefined
    ? Number(prevData.value)
    : 0

setLastMonth(format(prevVal))

  let t = 0

if (currentData?.target_value && currentData.target_value !== 0) {
  t = Number(currentData.target_value)
} else if (prevData?.target_value) {
  t = Number(prevData.target_value)
} else {
  t = Number(base.target_value ?? 0)
}

    // =========================
    // CURRENT MONTH VALUE 
    // =========================

const c = Number(currentData?.value ?? 0)

    setTarget(format(t))
    setValue(format(c))

    const finalTarget = t

// =========================
// TIME-BOUND SCORING (NP Scheduled only)
// =========================

const timeBoundLabels = [
  "NP Scheduled (GF)"
]

const isTimeBound = timeBoundLabels.includes(label)

// convert "45%" → 45 → 0.45
const percentIntoPeriodNum =
  parseFloat(String(percentIntoPeriod).replace('%', '')) / 100

let effectiveTarget = finalTarget

if (isTimeBound && percentIntoPeriodNum > 0) {
  effectiveTarget = finalTarget * percentIntoPeriodNum
}

if (effectiveTarget > 0) {
  const percent = Math.round((c / effectiveTarget) * 100)
  setScore(percent + '%')
} else {
  setScore('—')
}
  }

  fetchData()

}, [label, selectedMonth, sourceKeyResultId])


  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
  <span>{label}</span>

  {sourceLabel && (
    <span style={{
      fontSize: 11,
      color: '#6B7280',
      fontStyle: 'italic'
    }}>
      Pulls from {sourceLabel}
    </span>
  )}
</div>

        <input style={prevCell} value={lastMonth} readOnly />
        
        <input
  style={targetCell}
  value={target}
  readOnly={!isEditing}
  onChange={(e) => {
    setTarget(e.target.value)
    setIsDirty(true)
  }}
  onBlur={handleSave}
/>

        <input
            style={currentCell}
            value={value}
            readOnly={!isEditing}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
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