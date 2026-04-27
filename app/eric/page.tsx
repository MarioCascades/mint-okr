'use client'

export const dynamic = 'force-dynamic'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { supabase } from '../../lib/supabase'

// =========================
// KEYWORD MAP (SAFE MATCHING)
// =========================

const keywordMap: Record<string, string> = {
  "Missed Insurance Verifications": "Missed",
  "Total Insurance Verifications Completed for Families": "Completed",
  "Family Members Verified with Confirmed Benefits": "Verified",

  "Overdue Insurance Accounts": "Overdue",
  "Claims Returned as Underpaid": "Underpaid",
  "Total Balance Transferred to Patient Ledgers": "Balance",

  "BrightReferral": "BrightReferral",
  "Reception Rate (Inquiry to Booked) for BrightReferral": "Reception Rate"
}

// =========================
// PERCENTAGE FIELDS
// =========================

const percentageFields = [
  "Overdue Insurance Accounts",
  "Reception Rate (Inquiry to Booked) for BrightReferral"
]
const currencyFields = [
  "Total Balance Transferred to Patient Ledgers"
]

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
        <h1 style={title}>Eric - Insurance Coordinator</h1>

        <p style={description}>
          Provide insurance guidance to Mint Orthodontics team members and patients, ensure OrthoFi is properly leveraged and managed, and maximize insurance benefit utilization.
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
        </div>
      </div>

      <div style={content}>

        <Objective title="Objective 1: Insurance Verifications are Completed in a Timely Manner">
          <KeyResult label="Missed Insurance Verifications" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Total Insurance Verifications Completed for Families" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Family Members Verified with Confirmed Benefits" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 2: Insurance Claims are Submitted & Managed Appropriately">
          <KeyResult label="Overdue Insurance Accounts" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Claims Returned as Underpaid" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Total Balance Transferred to Patient Ledgers" selectedMonth={selectedMonth} isEditing={isEditing} />
        </Objective>

        <Objective title="Objective 3: Inquiry Tracking">
          <KeyResult label="BrightReferral" selectedMonth={selectedMonth} isEditing={isEditing} />
          <KeyResult label="Reception Rate (Inquiry to Booked) for BrightReferral" selectedMonth={selectedMonth} isEditing={isEditing} />
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
  const [showInitiatives, setShowInitiatives] = useState(false)
  const [initiatives, setInitiatives] = useState([
  '',
  '',
  ''
])

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [target, setTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const getScoreColor = () => {
  const num = Number(score.replace('%', ''))
  if (isNaN(num)) return '#fff'
  return num >= 100 ? '#22c55e' : '#c2410c'
}

  const isPercentage = percentageFields.includes(label)
  const isCurrency = currencyFields.includes(label)

  useEffect(() => {

    const fetchData = async () => {

      let base: any = null

const keyword = keywordMap[label] || label


const { data: ilikeData } = await supabase
  .from('dashboard_okr_data')
  .select('*')
  .eq('user_name', 'Eric')
  .ilike('key_result_title', `%${keyword}%`)

if (ilikeData && ilikeData.length === 1) {
  base = ilikeData[0]
} else {
  
  const { data: allData } = await supabase
    .from('dashboard_okr_data')
    .select('*')
    .eq('user_name', 'Eric')

 base = allData?.find((item: any) => {
  const db = item.key_result_title.toLowerCase().replace(/\s+/g, '')
  const ui = label.toLowerCase().replace(/\s+/g, '')

  return db.includes(ui) || ui.includes(db)
})
}

if (!base) {
  const { data: allData } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_title')
    .eq('user_name', 'Eric')

  console.log('ERIC DB KEY RESULTS:', allData)
  console.log('FAILED LABEL:', label)

  return
}

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

    const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

const currentDate = formatDate(selectedMonth)

const prev = new Date(selectedMonth)
prev.setMonth(prev.getMonth() - 1)

const prevDate = formatDate(prev)

// 👉 fetch CURRENT month target
const { data: currentRow } = await supabase
  .from('key_result_updates')
  .select('target_value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', currentDate)
  .maybeSingle()

// 👉 fetch PREVIOUS month target
const { data: prevRow } = await supabase
  .from('key_result_updates')
  .select('target_value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', prevDate)
  .maybeSingle()

let resolvedTarget =
  currentRow?.target_value ??
  prevRow?.target_value ??
  null

setTarget(resolvedTarget ? resolvedTarget.toString() : '')

if (!currentRow && resolvedTarget !== null) {
  await supabase.from('key_result_updates').upsert({
    key_result_id: base.key_result_id,
    reporting_month: currentDate,
    target_value: resolvedTarget,
  }, {
    onConflict: 'key_result_id,reporting_month'
  })
}

      const { data: current } = await supabase
        .from('key_result_updates')
        .select('value')
        .eq('key_result_id', base.key_result_id)
        .eq('reporting_month', currentDate)
        .maybeSingle()

      const currentValue = current?.value ?? base.current_value ?? ''
      setValue(currentValue)

      const { data: prevData } = await supabase
        .from('key_result_updates')
        .select('value')
        .eq('key_result_id', base.key_result_id)
        .eq('reporting_month', prevDate)
        .maybeSingle()

      setLastMonth(prevData?.value ?? '')

   if (resolvedTarget && Number(resolvedTarget) > 0) {
  const percent = Math.round(
    (Number(currentValue) / Number(resolvedTarget)) * 100
  )
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

    <div style={row}>
      <span>{label}</span>

      {/* LAST MONTH */}
<input
  style={cell}
  value={
    isPercentage && lastMonth
      ? lastMonth + '%'
      : isCurrency && lastMonth
      ? '$' + Number(lastMonth).toLocaleString()
      : lastMonth
  }
  readOnly
/>

{/* TARGET */}
<input
  style={cell}
  value={
    !isEditing
      ? isPercentage && target
        ? target + '%'
        : isCurrency && target
        ? '$' + Number(target).toLocaleString()
        : target
      : target
  }
  disabled={!isEditing}
  onChange={(e) =>
    setTarget(e.target.value.replace(/[^0-9.]/g, ''))
  }
  onBlur={handleSave}
/>

<input
  style={cell}
  value={
    !isEditing
      ? isPercentage && value
        ? value + '%'
        : isCurrency && value
        ? '$' + Number(value).toLocaleString()
        : value
      : value
  }
  disabled={!isEditing}
  onChange={(e) =>
    setValue(e.target.value.replace(/[^0-9.]/g, ''))
  }
  onBlur={handleSave}
/>

      <input
  style={{
    ...cell,
    color: getScoreColor(),
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
    {initiatives.map((item, index) => (
      <input
        key={index}
        style={{
          ...cell,
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
  backgroundColor: '#000',
  minHeight: '100vh',
  color: '#fff'
}

const stickyHeader: React.CSSProperties = {
  position: 'sticky',
  top: 60,
  zIndex: 10,
  backgroundColor: '#000',
  padding: 20,
  borderBottom: '1px solid #1F2937'
}

const content: React.CSSProperties = {
  padding: 20
}

const title: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700
}

const description: React.CSSProperties = {
  fontSize: 14,
  color: '#9CA3AF',
  marginBottom: 20,
  maxWidth: 800
}

const topSection: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20
}

const leftMeta: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10
}

const rightMeta: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10
}

const metaItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
}

const label: React.CSSProperties = {
  fontSize: 12,
  color: '#9CA3AF'
}

const inputSmall: React.CSSProperties = {
  height: 36,
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #1F2937',
  backgroundColor: '#0A0A0A',
  color: '#fff'
}

const monthSelector: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10
}

const arrowButton: React.CSSProperties = {
  backgroundColor: '#1F2937',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  color: '#fff',
  cursor: 'pointer'
}

const editButton: React.CSSProperties = {
  backgroundColor: '#00AEEF',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 6,
  color: '#000',
  fontWeight: 600,
  cursor: 'pointer'
}

const backButton: React.CSSProperties = {
  backgroundColor: '#1F2937',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 6,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12
}

const monthText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600
}

const objective: React.CSSProperties = {
  marginBottom: 40
}

const objectiveTitle: React.CSSProperties = {
  color: '#00AEEF'
}

const headerRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 8,
  marginBottom: 10
}

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 8,
  marginBottom: 6
}

const cell: React.CSSProperties = {
  background: '#0A0A0A',
  border: '1px solid #1F2937',
  borderRadius: 6,
  color: '#fff'
}

const button: React.CSSProperties = {
  backgroundColor: '#00AEEF',
  border: 'none',
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
  color: '#000',
  fontSize: 12
}

const initiativeRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 8,
  marginTop: 10,
  marginBottom: 12
}