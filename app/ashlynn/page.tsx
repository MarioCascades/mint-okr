'use client'

export const dynamic = 'force-dynamic'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { supabase } from '../../lib/supabase'

const labelMap: Record<string, string> = {
  "Missed Slack Orders": "Missed Slack Orders",
  "# of Orders Impacting Shipping Costs": "Orders Impacting Shipping Costs",
  "# of Items Supply Depleted Impacting Clinic": "Items Supply Depleted",

  "Lab Invoice Errors Identified": "Lab Invoice Errors",
  "Lab Invoices Paid on Time": "Lab Invoices Paid On Time",
  "Refunds/Credits Requested": "Refund Requests",
  "Partners Appliance Errors": "Appliance Errors",

  "# of Orders Missing from Scan Report": "Orders Missing Scan Report",
  "Patients Rescheduled Due to Appliance Timing": "Patients Rescheduled",
  "DM Turned On After Curbside Pickup (Spot Check)": "DM Turned On"
}
const keywordMap: Record<string, string> = {
  "# of Orders Impacting Shipping Costs": "Shipping",
  "# of Items Supply Depleted Impacting Clinic": "Supply",
  "Refunds/Credits Requested": "Refund",
  "# of Orders Missing from Scan Report": "Scan",
  "DM Turned On After Curbside Pickup (Spot Check)": "DM"
}

// =========================
// PAGE
// =========================

export default function Page() {

  const router = useRouter()

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [lastUpdated, setLastUpdated] = useState('')
  const [percentIntoPeriod, setPercentIntoPeriod] = useState('')
  const [isEditing, setIsEditing] = useState(false)

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
        setLastUpdated(new Date(data[0].last_updated_at).toLocaleString())
      }
    }

    fetchLastUpdated()
  }, [])

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
        <h1 style={title}>Ashlynn - Clinical Operations & Systems Coordinator</h1>

        <p style={description}>
          Responsible for ensuring smooth, accurate, and cost-effective clinical operations by auditing workflows, managing lab and vendor processes, preventing chairside issues, and serving as a central support resource.
        </p>

        <div style={topSection}>

          <div style={leftMeta}>
            <div style={metaItem}>
              <label style={label}>Date Updated</label>
              <div style={inputSmall}>{lastUpdated || '—'}</div>
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

      <div style={content}>

        <Objective title="Objective 1: Inventory Management">
          <KeyResult label="Missed Slack Orders" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="# of Orders Impacting Shipping Costs" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="# of Items Supply Depleted Impacting Clinic" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 2: Accuracy in Lab Billing & Payments">
          <KeyResult label="Lab Invoice Errors Identified" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Lab Invoices Paid on Time" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Refunds/Credits Requested" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Partners Appliance Errors" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 3: Clinical Workflow Auditing">
          <KeyResult label="# of Orders Missing from Scan Report" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Patients Rescheduled Due to Appliance Timing" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="DM Turned On After Curbside Pickup (Spot Check)" selectedMonth={selectedMonth} isEditing={isEditing} />
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
// KEY RESULT (HYBRID FETCH)
// =========================

const KeyResult = ({ label, selectedMonth, isEditing }: any) => {

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [target, setTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const [showInitiatives, setShowInitiatives] = useState(false)

  useEffect(() => {

    const fetchData = async () => {

    const dbLabel = labelMap[label] || label
    const keyword = keywordMap[label] || dbLabel

    const { data: base } = await supabase
  .from('dashboard_okr_data')
  .select('*')
  .eq('user_name', 'Ashlynn')
 .ilike('key_result_title', `%${keyword}%`)
  .maybeSingle()

if (!base) return

      setKeyResultId(base.key_result_id)

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

const currentDate = formatDate(selectedMonth)

const prevMonthDate = new Date(selectedMonth)
prevMonthDate.setMonth(prevMonthDate.getMonth() - 1)
const prevDate = formatDate(prevMonthDate)

 const { data: prevRow } = await supabase
  .from('key_result_updates')
  .select('target_value, value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', prevDate)
  .maybeSingle()

// CURRENT MONTH TARGET
const { data: currentRow } = await supabase
  .from('key_result_updates')
  .select('target_value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', currentDate)
  .maybeSingle()

// BASE TARGET (fallback only)
const { data: baseKR } = await supabase
  .from('key_results')
  .select('target_value')
  .eq('id', base.key_result_id)
  .maybeSingle()

let resolvedTarget =
  currentRow?.target_value != null
    ? currentRow.target_value
    : prevRow?.target_value != null
    ? prevRow.target_value
    : baseKR?.target_value != null
    ? baseKR.target_value
    : null


if (target === '') {
  setTarget(resolvedTarget !== null ? String(resolvedTarget) : '')
}

if (
  (currentRow?.target_value === null || currentRow?.target_value === undefined) &&
  resolvedTarget !== null &&
  resolvedTarget !== ''
) {
  await supabase
    .from('key_result_updates')
    .upsert(
      {
        key_result_id: base.key_result_id,
        reporting_month: currentDate,
        target_value: resolvedTarget,
      },
      { onConflict: 'key_result_id,reporting_month' }
    )
}


      
      const { data: current } = await supabase
        .from('key_result_updates')
        .select('value')
        .eq('key_result_id', base.key_result_id)
        .eq('reporting_month', currentDate)
        .maybeSingle()

      const currentValue = current?.value ?? base.current_value ?? ''
      setValue(currentValue)

   

     setLastMonth(prevRow?.value ?? '')

    if (resolvedTarget && Number(resolvedTarget) > 0) {
  const percent = Math.round((Number(currentValue) / Number(resolvedTarget)) * 100)
  setScore(percent + '%')
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
  const getScoreColor = () => {
    const num = Number(score.replace('%', ''))
    return num >= 100 ? '#22c55e' : '#c2410c'
  }

  return (
  <div style={{ marginBottom: 10 }}>

    <div style={row}>
      <span>{label}</span>

      <input style={cell} value={lastMonth} readOnly />

      <input
  style={cell}
  value={target}
  disabled={!isEditing}
  onChange={(e) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setTarget(val)
  }}
  onBlur={handleSave}
/>

      <input
        style={cell}
        value={value}
        disabled={!isEditing}
        onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={handleSave}
      />

      <input
  style={{
    ...cell,
    color: score ? getScoreColor() : '#fff',
    fontWeight: 600
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
        <input style={cell} placeholder="Initiative 1..." />
        <input style={cell} placeholder="Initiative 2..." />
        <input style={cell} placeholder="Initiative 3..." />
      </div>
    )}

  </div>
)
}

// =========================
// STYLES
// =========================

const container : React.CSSProperties = { backgroundColor: '#000', minHeight: '100vh', color: '#fff' }
const stickyHeader : React.CSSProperties = { 
  position: 'sticky',
  top: 60, // 👈 sits under TopNav
  zIndex: 10,
  backgroundColor: '#000',
  padding: 20,
  borderBottom: '1px solid #1F2937'
}
const content : React.CSSProperties = { padding: 20 }
const title : React.CSSProperties = { fontSize: 24, fontWeight: 700 }
const description : React.CSSProperties = { fontSize: 13, color: '#9CA3AF', marginTop: 6 }

const topSection : React.CSSProperties = { display: 'flex', justifyContent: 'space-between' }
const leftMeta : React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }
const rightMeta : React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }

const metaItem : React.CSSProperties = { display: 'flex', flexDirection: 'column' }
const label : React.CSSProperties = { fontSize: 12, color: '#9CA3AF' }

const inputSmall : React.CSSProperties = { padding: 8, background: '#0A0A0A', border: '1px solid #1F2937' }

const monthSelector : React.CSSProperties = { display: 'flex', gap: 10 }
const editButton : React.CSSProperties = { backgroundColor: '#00AEEF', padding: 6 }
const backButton : React.CSSProperties = { backgroundColor: '#1F2937', padding: 6 }

const objective : React.CSSProperties = { marginBottom: 40 }
const objectiveTitle : React.CSSProperties = { color: '#00AEEF' }

const headerRow : React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 8
}

const row : React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 8
}

const cell : React.CSSProperties = {
  background: '#0A0A0A',
  border: '1px solid #1F2937',
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
const arrowButton: React.CSSProperties = {
  backgroundColor: '#1F2937',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  color: '#fff',
  cursor: 'pointer'
}

const monthText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600
}